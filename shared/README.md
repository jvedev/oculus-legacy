# Shared Modules

This directory contains modularized components extracted from the original monolithic session/functions.js file.

## Directory Structure

```
shared/
├── dom/                          # DOM manipulation modules
│   ├── xdom.js                   # XDOM library - Cross-browser DOM operations (33.4KB)
│   └── browser-detect.js         # Browser detection utilities (8.1KB)
├── navigation/                   # Navigation system components  
│   ├── stack.js                  # NAV.Stack - Navigation stack management (29.8KB)
│   ├── macro.js                  # NAV.Macro - Macro execution system (11.8KB)
│   ├── sub-procedure.js          # NAV.SubProcedure - Sub-procedure management (19.0KB)
│   ├── procedure.js              # NAV.Procedure - Main procedure system (7.5KB)
│   └── session-launcher.js       # Session launching utilities (5.4KB)
├── gui/                          # GUI components
│   └── components.js             # GUI factory and base classes (56.6KB)
├── ajax/                         # AJAX utilities
│   └── advanced-ajax.js          # Advanced AJAX functionality
└── utils/                        # Utility functions
    ├── string-prototypes.js      # String prototype extensions
    ├── date-prototypes.js        # Date prototype extensions  
    └── all-functions.js          # Legacy utility functions
```

## Extracted Components

### DOM Manipulation (41.5KB total)
- **XDOM**: Cross-browser DOM manipulation library with ~100 methods
- **BrowserDetect**: Browser detection and compatibility utilities

### Navigation System (60.6KB total)  
- **NAV.Stack**: Manages navigation stack and workflow state
- **NAV.Macro**: Handles macro execution and targets
- **NAV.SubProcedure**: Manages sub-procedures and their options
- **NAV.Procedure**: Main procedure system (existing)

### GUI Components (56.6KB total)
- **GUI.factory**: Factory methods for creating UI components
- **GUI.BaseObject**: Base class for all GUI objects
- **GUI.BasePanel**: Panel management and rendering

## Backward Compatibility

All extracted modules maintain 100% backward compatibility:
- Global variables are preserved (window.XDOM, window.NAV, window.GUI)
- Function signatures remain identical
- All existing functionality is available exactly as before

## Benefits

- **Modular architecture**: Clear separation of concerns
- **Reduced duplication**: Shared code between main and session bundles  
- **Better maintainability**: Focused, single-purpose modules
- **Optimized bundles**: Tree-shaking and code splitting
- **Developer experience**: Easier to understand and modify specific features

## Usage

The modules are automatically imported by the main entry points:
- `src/main/main.js` - Main application
- `src/session/session.js` - Session application

No changes are required to existing code - all globals remain available.