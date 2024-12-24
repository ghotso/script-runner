# Script Management

## Script Types

Script Runner supports two types of scripts:
- Python scripts
- Bash scripts

## Script Structure

Each script consists of:
- Metadata (name, type, tags)
- Dependencies
- Script code
- Execution schedules
- Execution history

## Dependencies

### Python Dependencies

- Use pip-style requirements
- One dependency per line
- Version pinning supported

Example:
```txt
requests==2.28.1
pandas>=1.4.0
numpy

