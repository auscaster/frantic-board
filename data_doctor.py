import pandas as pd
import io
import sys
import json

def clean_data(input_csv: str, fill_strategy: str = 'mean', remove_duplicates: bool = True) -> str:
    """
    Clean input CSV data by handling missing values, duplicates, and type issues.

    Parameters:
    - input_csv: str, raw CSV content
    - fill_strategy: str, one of 'mean', 'median', 'mode', 'drop'
    - remove_duplicates: bool, if True remove duplicate rows

    Returns:
    - str, cleaned CSV content
    """
    try:
        df = pd.read_csv(io.StringIO(input_csv))
    except Exception as e:
        raise ValueError(f"Failed to parse CSV: {e}")

    # Remove duplicates if requested
    if remove_duplicates:
        df = df.drop_duplicates()

    # Handle missing values
    if fill_strategy == 'drop':
        df = df.dropna()
    else:
        numeric_cols = df.select_dtypes(include=['number']).columns
        non_numeric_cols = df.select_dtypes(exclude=['number']).columns

        for col in numeric_cols:
            if df[col].isnull().any():
                if fill_strategy == 'mean':
                    fill_val = df[col].mean()
                elif fill_strategy == 'median':
                    fill_val = df[col].median()
                elif fill_strategy == 'mode':
                    fill_val = df[col].mode().iloc[0] if not df[col].mode().empty else None
                else:
                    raise ValueError(f"Unknown fill strategy: {fill_strategy}")
                if fill_val is not None:
                    df[col] = df[col].fillna(fill_val)

        for col in non_numeric_cols:
            if df[col].isnull().any():
                if fill_strategy == 'mode':
                    fill_val = df[col].mode().iloc[0] if not df[col].mode().empty else ''
                    df[col] = df[col].fillna(fill_val)
                else:
                    # For non-numeric, drop or fill with empty string fallback
                    if fill_strategy == 'drop':
                        df = df.dropna(subset=[col])
                    else:
                        df[col] = df[col].fillna('')

    # Additional type cleaning: ensure numeric columns are numeric
    for col in df.columns:
        if df[col].dtype == 'object':
            # Try to convert to numeric if possible
            try:
                converted = pd.to_numeric(df[col], errors='coerce')
                if converted.notna().sum() > len(df) * 0.8:
                    df[col] = converted
            except:
                pass

    # Return cleaned CSV
    output = io.StringIO()
    df.to_csv(output, index=False)
    return output.getvalue()

def main():
    """Entry point for runx skill."""
    try:
        input_data = sys.stdin.read()
        params = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {}
        fill_strategy = params.get('fill_strategy', 'mean')
        remove_duplicates = params.get('remove_duplicates', True)
        cleaned = clean_data(input_data, fill_strategy, remove_duplicates)
        sys.stdout.write(cleaned)
    except Exception as e:
        sys.stderr.write(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main()
