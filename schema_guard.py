import jsonschema
from jsonschema import validate, ValidationError
from typing import Any, Dict

def schema_guard(schema: Dict[str, Any], data: Any) -> bool:
    """
    Validate data against a JSON schema.

    Args:
        schema: JSON schema dictionary.
        data: Data to validate.

    Returns:
        True if valid, False otherwise.
    """
    try:
        validate(instance=data, schema=schema)
        return True
    except ValidationError as e:
        return False

if __name__ == "__main__":
    # Example usage
    example_schema = {
        "type": "object",
        "properties": {
            "name": {"type": "string"},
            "age": {"type": "integer", "minimum": 0}
        },
        "required": ["name", "age"]
    }
    valid_data = {"name": "Alice", "age": 30}
    invalid_data = {"name": "Bob", "age": -5}
    print(schema_guard(example_schema, valid_data))   # True
    print(schema_guard(example_schema, invalid_data)) # False
