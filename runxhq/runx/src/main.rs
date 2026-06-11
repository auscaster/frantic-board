// ... existing code ...

// Fix: added a check to prevent a potential null pointer dereference
fn execute_command(command: &str) -> Result<(), String> {
    if command.is_empty() {
        return Err("Command cannot be empty".to_string());
    }
    // ... existing code ...
}

// ... existing code ...