# Results Processor Logging Configuration

This document describes the logging strategy implemented for the Results Processor application.

## Logging Strategy Overview

The application now implements a dual logging approach with three separate log files:

### 1. Long Log (`logs/results-processor-long.log`)
- **Purpose**: Historical log data that persists across multiple executions
- **Retention**: 90 days of history with rolling files
- **File Size**: Up to 5MB per file before rolling
- **Total Capacity**: 500MB maximum across all historical files
- **Naming Pattern**: `results-processor-long.YYYY-MM-DD.{index}.log`

### 2. Last Execution Log (`logs/last-execution.log`)
- **Purpose**: Fresh log for the current/last execution only
- **Behavior**: Overwrites completely on each application start
- **Use Case**: Quick access to see what happened in the most recent run
- **File Size**: No limit (single execution only)

### 3. Legacy Log (`logs/results-processor.log`)
- **Purpose**: Maintains backward compatibility
- **Retention**: 30 days of history
- **File Size**: Up to 1MB per file before rolling
- **Total Capacity**: 100MB maximum

## Log File Locations

```
logs/
├── results-processor-long.log          # Current long-term log
├── results-processor-long.2025-08-21.0.log  # Historical long-term logs
├── last-execution.log                  # Last execution only
├── results-processor.log               # Current legacy log
└── results-processor.2025-08-21.0.log  # Historical legacy logs
```

## Log Format

All log files use the same format:
```
YYYY-MM-DD HH:mm:ss.SSS [thread] LEVEL logger.class.name - message
```

Example:
```
2025-08-21 18:24:42.123 [main] INFO  com.mongodb.workshop.ResultsProcessor - Starting Results Processor application...
```

## Usage Scenarios

### Debugging Current Issues
- Check `logs/last-execution.log` for the most recent run
- This file is clean and contains only the latest execution

### Historical Analysis
- Check `logs/results-processor-long.log` for recent activity
- Browse historical files `logs/results-processor-long.YYYY-MM-DD.*.log`

### Log Level Control
Set the `LOG_LEVEL` environment variable to control verbosity:
- `ERROR`: Only errors
- `WARN`: Warnings and errors
- `INFO`: General information (default)
- `DEBUG`: Detailed debugging information

### Custom Log Path
Set the `LOG_PATH` environment variable to specify a custom directory for log files:
- **Default**: `logs` (relative to application directory)
- **Example**: `LOG_PATH=/var/log/results-processor`
- **Example**: `LOG_PATH=/home/user/app-logs`

All log files will be created in the specified directory:
```bash
export LOG_PATH=/var/log/results-processor
# Results in:
# /var/log/results-processor/results-processor-long.log
# /var/log/results-processor/last-execution.log
# /var/log/results-processor/results-processor.log
```

## Configuration Details

The logging configuration is defined in `src/main/resources/logback.xml`:

- **Console Output**: Always enabled for real-time monitoring
- **Multiple Appenders**: All four appenders write simultaneously
- **MongoDB Driver**: Set to WARN level to reduce noise
- **Thread Safety**: All appenders are thread-safe

## Benefits

1. **Historical Tracking**: Long-term log maintains complete history
2. **Quick Debugging**: Last execution log provides clean, focused view
3. **Backward Compatibility**: Existing log analysis tools continue to work
4. **Flexible Retention**: Different retention policies for different use cases
5. **Space Management**: Automatic cleanup prevents disk space issues
