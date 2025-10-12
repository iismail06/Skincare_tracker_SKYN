# Database Structure Documentation

This directory contains documentation related to the database structure of the SKYN - Skincare Routine Tracker application.

## Entity-Relationship Diagram

![SKYN Database ER Diagram](er_diagram.png)

## Database Schema

The SKYN application uses a relational database with the following key tables:

### users.user

- Core user authentication data
- Stores username, email, password hash, and account creation date
- Primary entity for authentication and authorization

### user.userProfile

- Extended user information
- Stores skin type, main concerns, age range, and preferences
- One-to-one relationship with users.user

### products.product

- Product inventory information
- Stores product name, brand, type, ingredients, expiry date
- Tracks user ratings and favorites
- Many-to-one relationship with users.user (product owner)

### routines.routine

- Skincare routine definitions
- Stores routine name, type (AM/PM/Weekly), and creation dates
- Many-to-one relationship with users.user (routine owner)

### routine.routinestep

- Steps within a skincare routine
- Stores step name, order, and frequency
- Many-to-one relationship with routines.routine
- Optional many-to-one relationship with products.product

### routines.dailycompletion

- Tracks daily completion of routine steps
- Records completion date and time
- Many-to-one relationships with users.user and routine_step

## Schema Design Decisions

1. **Separate User Profile**: Keeps core authentication data separate from changeable profile information
2. **Flexible Routine Steps**: Allows steps to be defined with or without associated products
3. **Completion Tracking**: Enables detailed analytics on routine adherence
4. **Time-based Fields**: Creation and update timestamps for all major entities to support history tracking

## Future Schema Enhancements

- Product category taxonomy
- Ingredient classification and analysis
- Routine templates and sharing
- Enhanced analytics capabilities
