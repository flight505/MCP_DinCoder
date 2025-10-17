# Project Constitution: CLI Tool

## Project Principles

### 1. User-Friendly CLI
- Follow POSIX conventions
- Provide helpful error messages
- Support --help and --version flags
- Interactive prompts for complex operations

### 2. Performance
- Fast startup time (< 100ms)
- Efficient processing
- Progress indicators for long operations
- Minimal dependencies

### 3. Compatibility
- Cross-platform (Windows, macOS, Linux)
- Respect system conventions
- Handle different shells (bash, zsh, fish, PowerShell)

### 4. Developer Experience
- Self-documenting code
- Comprehensive test coverage
- Easy to install and update
- Clear usage examples

## Technical Constraints

- **Node.js**: >= 20.0.0 (if using Node)
- **Python**: >= 3.11 (if using Python)
- **Go**: >= 1.21 (if using Go)
- **Rust**: >= 1.70 (if using Rust)
- **Startup Time**: < 100ms
- **Binary Size**: < 20MB

## Library Preferences

### Node.js
- **CLI Framework**: Commander.js or yargs
- **Prompts**: inquirer or prompts
- **Colors**: chalk
- **Progress**: ora or cli-progress
- **Config**: cosmiconfig

### Python
- **CLI Framework**: Click or Typer
- **Progress**: rich or tqdm
- **Config**: click-config or python-dotenv

### Go
- **CLI Framework**: Cobra
- **Config**: Viper
- **Output**: lipgloss for styling

### Rust
- **CLI Framework**: clap
- **Error Handling**: anyhow
- **Terminal**: crossterm

## Architecture

- Command pattern for subcommands
- Plugin architecture for extensibility
- Configuration file support
- Environment variable support

---

*Optimized for cross-platform command-line tools*
