# ml/scripts/extract_flash_reports.py
import pdfplumber
import pandas as pd
import re
from pathlib import Path
from datetime import datetime

def clean_header(header):
    """Clean up messy PDF headers"""
    if not header:
        return ""
    # Remove newlines and extra spaces
    header = re.sub(r'\s+', ' ', header).strip()
    # Standardize common variations
    header = header.replace('Orignal', 'Original')
    header = header.replace('Cumulative Expenditure', 'cumulative_expenditure')
    header = header.replace('Physical Progress', 'physical_progress')
    return header.lower().replace(' ', '_')

def extract_project_table(pdf_path):
    """Extract the main 'All Ongoing Projects' table from a flash report PDF"""
    print(f"Processing: {pdf_path.name}")
    
    projects = []
    
    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages, 1):
            # Extract tables from the page
            tables = page.extract_tables({
                "vertical_strategy": "lines",
                "horizontal_strategy": "lines",
                "snap_x_tolerance": 10,
                "snap_y_tolerance": 10,
            })
            
            for table in tables:
                if not table or len(table) < 2:
                    continue
                
                # Check if this looks like our target table
                # It should have project names and cost/progress data
                first_row = table[0]
                if any(first_row) and any('project' in str(cell).lower() or 'sl.no' in str(cell).lower() 
                                          for cell in first_row if cell):
                    
                    # Clean headers
                    headers = [clean_header(h) if h else f'col_{i}' for i, h in enumerate(first_row)]
                    
                    # Process data rows
                    for row in table[1:]:
                        if not row or not any(row):
                            continue
                        
                        # Create project dict
                        project = {}
                        for i, cell in enumerate(row):
                            if i < len(headers):
                                project[headers[i]] = cell
                        
                        # Filter out rows that don't have meaningful data
                        if project.get('project_name(agency)(project_code)') or project.get('sl.no'):
                            projects.append(project)
    
    if not projects:
        print(f"  ⚠️  No projects found in {pdf_path.name}")
        return None
    
    # Create DataFrame
    df = pd.DataFrame(projects)
    
    # Standardize column names
    column_mapping = {
        'sl.no': 'sl_no',
        'project_name(agency)(project_code)': 'project_name_raw',
        'state': 'state',
        'date_of_approval_(start_date)_mm/yyyy': 'start_date',
        'orignal/target_doc_(revised_doc)_mm/yyyy': 'commissioning_dates',
        'orignal_cost': 'original_cost',
        'original_cost': 'original_cost',
        'revised_cost': 'revised_cost',
        'cumulative_expenditure': 'cumulative_expenditure',
        'physical_progress_(%)': 'physical_progress',
        'physical_progress': 'physical_progress'
    }
    
    df = df.rename(columns={k: v for k, v in column_mapping.items() if k in df.columns})
    
    # Parse project name and extract project code
    if 'project_name_raw' in df.columns:
        # Extract project code (usually in parentheses at the end)
        df['project_code'] = df['project_name_raw'].str.extract(r'\((\d{6,7})\)', expand=False)
        # Clean project name
        df['project_name'] = df['project_name_raw'].str.replace(r'\s*\(\d{6,7}\)\s*', '', regex=True).str.strip()
        # Extract agency
        df['agency'] = df['project_name_raw'].str.extract(r'\[([^\]]+)\]', expand=False)
        
    # Parse dates (format: MM/YYYY)
    for date_col in ['start_date', 'commissioning_dates']:
        if date_col in df.columns:
            # Handle the "(MM/YYYY)" format
            df[date_col] = df[date_col].str.replace(r'[()]', '', regex=True).str.strip()
    
    # Split commissioning dates into original and revised
    if 'commissioning_dates' in df.columns:
        # Format is usually "MM/YYYY (MM/YYYY)" or "MM/YYYY (-)"
        df['original_commissioning'] = df['commissioning_dates'].str.split().str[0]
        df['revised_commissioning'] = df['commissioning_dates'].str.extract(r'\(([^)]+)\)', expand=False)
        df['revised_commissioning'] = df['revised_commissioning'].replace('-', pd.NA)
    
    # Clean numeric columns
    numeric_cols = ['original_cost', 'revised_cost', 'cumulative_expenditure', 'physical_progress']
    for col in numeric_cols:
        if col in df.columns:
            # Remove commas and convert to float
            df[col] = pd.to_numeric(
                df[col].astype(str).str.replace(',', '').str.strip(), 
                errors='coerce'
            )
    
    # Add report month column
    # Extract month from filename (FlashReport_January_2026.pdf)
    month_match = re.search(r'(\w+)_(\d{4})', pdf_path.stem, re.IGNORECASE)
    if month_match:
        month_name = month_match.group(1)
        year = month_match.group(2)
        df['report_month'] = f"{month_name} {year}"
    
    # Keep only relevant columns
    final_cols = [
        'sl_no', 'project_code', 'project_name', 'agency', 'state',
        'start_date', 'original_commissioning', 'revised_commissioning',
        'original_cost', 'revised_cost', 'cumulative_expenditure', 'physical_progress',
        'report_month'
    ]
    
    df = df[[col for col in final_cols if col in df.columns]]
    
    print(f"  ✓ Extracted {len(df)} projects")
    return df

def process_all_reports(input_dir, output_file):
    """Process all flash report PDFs in a directory"""
    input_path = Path(input_dir)
    pdf_files = sorted(input_path.glob('*.pdf'))
    
    if not pdf_files:
        print(f"No PDF files found in {input_dir}")
        return
    
    print(f"Found {len(pdf_files)} PDF files to process\n")
    
    all_projects = []
    
    for pdf_file in pdf_files:
        df = extract_project_table(pdf_file)
        if df is not None and len(df) > 0:
            all_projects.append(df)
    
    if all_projects:
        # Combine all DataFrames
        combined_df = pd.concat(all_projects, ignore_index=True)
        
        # Save to CSV
        combined_df.to_csv(output_file, index=False, encoding='utf-8')
        print(f"\n✅ Successfully extracted {len(combined_df)} total project records")
        print(f"💾 Saved to: {output_file}")
        
        # Show summary
        print(f"\n📊 Summary:")
        print(f"   Reports processed: {len(all_projects)}")
        print(f"   Unique projects: {combined_df['project_code'].nunique()}")
        print(f"   Months covered: {combined_df['report_month'].nunique()}")
        
        # Show sample
        print(f"\n📋 Sample data:")
        print(combined_df.head())
    else:
        print("❌ No data extracted from any PDF")

if __name__ == "__main__":
    # Configuration
    INPUT_DIR = "ml/data/flash_reports"  # Put your PDFs here
    OUTPUT_FILE = "ml/data/monthly_progress_data.csv"
    
    # Create input directory if it doesn't exist
    Path(INPUT_DIR).mkdir(parents=True, exist_ok=True)
    
    print("🔍 Flash Report PDF Extractor")
    print("=" * 50)
    print(f"Input directory: {INPUT_DIR}")
    print(f"Output file: {OUTPUT_FILE}")
    print("=" * 50)
    print()
    
    process_all_reports(INPUT_DIR, OUTPUT_FILE)