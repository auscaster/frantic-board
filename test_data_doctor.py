"""
Unit tests for DataDoctorSkill.
"""

import pandas as pd
import numpy as np
from data_doctor import DataDoctorSkill


def test_fix_missing_values_mean():
    df = pd.DataFrame({'A': [1, 2, np.nan], 'B': [4, np.nan, 6]})
    result = DataDoctorSkill.fix_missing_values(df, strategy='mean')
    assert result['A'].isnull().sum() == 0
    assert result['B'].isnull().sum() == 0
    assert result['A'][2] == 1.5


def test_fix_missing_values_drop():
    df = pd.DataFrame({'A': [1, np.nan, 3]})
    result = DataDoctorSkill.fix_missing_values(df, strategy='drop')
    assert len(result) == 2


def test_remove_outliers():
    df = pd.DataFrame({'A': [1, 2, 3, 100], 'B': [1, 2, 3, 4]})
    result = DataDoctorSkill.remove_outliers(df, columns=['A'], threshold=2)
    assert 100 not in result['A'].values
    assert len(result) == 3


def test_convert_dtype():
    df = pd.DataFrame({'A': ['1', '2', '3']})
    result = DataDoctorSkill.convert_dtype(df, 'A', 'int')
    assert result['A'].dtype == int


def test_diagnose():
    df = pd.DataFrame({'A': [1, np.nan, 3], 'B': ['x', 'y', 'z']})
    report = DataDoctorSkill.diagnose(df)
    assert 'missing_values' in report
    assert 'dtypes' in report
    assert 'outlier_counts' in report
    assert report['missing_values']['A'] == 1
    assert report['missing_values']['B'] == 0


if __name__ == '__main__':
    test_fix_missing_values_mean()
    test_fix_missing_values_drop()
    test_remove_outliers()
    test_convert_dtype()
    test_diagnose()
    print("All tests passed.")
