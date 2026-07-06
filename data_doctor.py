"""
runx skill: data doctor

Provides data cleaning and repair functionalities.
"""

import pandas as pd
import numpy as np


class DataDoctorSkill:
    """Skill to diagnose and fix common data issues."""

    @staticmethod
    def fix_missing_values(df: pd.DataFrame, strategy: str = "mean") -> pd.DataFrame:
        """
        Fill missing values in numeric columns using specified strategy.

        Args:
            df: Input DataFrame.
            strategy: 'mean', 'median', 'mode', or 'drop'.

        Returns:
            DataFrame with missing values handled.
        """
        df = df.copy()
        if strategy == "drop":
            return df.dropna()
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            if df[col].isnull().any():
                if strategy == "mean":
                    df[col].fillna(df[col].mean(), inplace=True)
                elif strategy == "median":
                    df[col].fillna(df[col].median(), inplace=True)
                elif strategy == "mode":
                    df[col].fillna(df[col].mode()[0], inplace=True)
        return df

    @staticmethod
    def remove_outliers(df: pd.DataFrame, columns: list = None, threshold: float = 3.0) -> pd.DataFrame:
        """
        Remove rows with outliers based on z-score.

        Args:
            df: Input DataFrame.
            columns: List of column names to check. If None, check all numeric.
            threshold: Z-score threshold.

        Returns:
            DataFrame without outliers.
        """
        if columns is None:
            columns = df.select_dtypes(include=[np.number]).columns.tolist()
        mask = pd.Series([True] * len(df))
        for col in columns:
            col_zscore = np.abs((df[col] - df[col].mean()) / df[col].std())
            mask &= col_zscore < threshold
        return df[mask].reset_index(drop=True)

    @staticmethod
    def convert_dtype(df: pd.DataFrame, column: str, target_type: str) -> pd.DataFrame:
        """
        Convert a column to a specified data type.

        Args:
            df: Input DataFrame.
            column: Column name.
            target_type: e.g., 'int', 'float', 'str', 'datetime'.

        Returns:
            DataFrame with converted column.
        """
        df = df.copy()
        try:
            if target_type == 'int':
                df[column] = df[column].astype(int)
            elif target_type == 'float':
                df[column] = df[column].astype(float)
            elif target_type == 'str':
                df[column] = df[column].astype(str)
            elif target_type == 'datetime':
                df[column] = pd.to_datetime(df[column])
            else:
                raise ValueError(f"Unsupported type: {target_type}")
        except Exception as e:
            raise RuntimeError(f"Conversion failed for column '{column}': {e}")
        return df

    @staticmethod
    def diagnose(df: pd.DataFrame) -> dict:
        """
        Generate a diagnostic report of the DataFrame.

        Args:
            df: Input DataFrame.

        Returns:
            Dictionary with missing counts, outlier counts, and dtypes.
        """
        report = {}
        report['missing_values'] = df.isnull().sum().to_dict()
        report['dtypes'] = df.dtypes.astype(str).to_dict()
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        outlier_counts = {}
        for col in numeric_cols:
            z = np.abs((df[col] - df[col].mean()) / df[col].std())
            outlier_counts[col] = int((z > 3).sum())
        report['outlier_counts'] = outlier_counts
        return report
