import pandas as pd
import numpy as np

def clean_data(input_path='raw_data.csv', output_path='cleaned_data.csv'):
    # Load the raw dataset
    df = pd.read_csv(input_path)
    
    # 1. Handle missing values if any
    df = df.dropna()
    
    # 2. Parse 'dimensions' (format: 'LxWxH') into separate numeric columns
    dimensions_split = df['dimensions'].str.split('x', expand=True)
    df['length'] = pd.to_numeric(dimensions_split[0])
    df['width'] = pd.to_numeric(dimensions_split[1])
    df['height'] = pd.to_numeric(dimensions_split[2])
    
    # Drop the original string dimensions column
    df = df.drop(columns=['dimensions'])
    
    # 3. Clean and normalize text columns
    for col in ['item_type', 'material_type', 'finish_type', 'urgency_level']:
        if col in df.columns:
            df[col] = df[col].astype(str).str.lower().str.strip()
            
    # 4. Remove any unrealistic numerical outliers (e.g., negative labor hours or price)
    df = df[(df['labor_hours'] > 0) & (df['price'] > 0) & (df['quantity'] > 0)]
    
    # 5. Save the cleaned dataset
    df.to_csv(output_path, index=False)
    print(f"Data cleaned successfully. Saved {len(df)} rows to {output_path}.")

if __name__ == "__main__":
    clean_data()