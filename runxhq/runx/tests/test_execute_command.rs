// ... existing code ...

#[test]
fn test_execute_command_empty() {
    let result = execute_command("");
    assert!(result.is_err());
    assert_eq!(result.unwrap_err(), "Command cannot be empty");
}

// ... existing code ...