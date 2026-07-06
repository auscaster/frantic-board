# Data Doctor Skill for runx

## Description
A skill that provides data cleaning and repair functionalities, including handling missing values, removing outliers, converting data types, and diagnosing common issues.

## Usage

```python
import pandas as pd
from data_doctor import DataDoctorSkill

df = pd.DataFrame(...)

# Fix missing values
cleaned = DataDoctorSkill.fix_missing_values(df, strategy='mean')

# Remove outliers
cleaned = DataDoctorSkill.remove_outliers(df, columns=['value'], threshold=3)

# Convert dtype
cleaned = DataDoctorSkill.convert_dtype(df, 'date', 'datetime')

# Diagnose
report = DataDoctorSkill.diagnose(df)
```

## Requirements
- pandas
- numpy

## License
MIT
