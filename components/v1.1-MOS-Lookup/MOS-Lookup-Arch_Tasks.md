# MOS Lookup – Architecture & Tasks

# UI Position
    - Appears below “How It Works”
    - Above translator card
    - Self-contained card that expands to show results

# Component Behavior
    - Branch dropdown
    - MOS input
    - “Find Roles” button
    - After fetch → expand card section showing top 5 roles

# State Structure
    - branch (string)
    - mos (string)
    - roles (array)
    - loading (boolean)
    - error (string | null)

# Styling
    - Match existing card styles
    - 32–48px spacing above and below
    - Dark theme consistency