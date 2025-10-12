# Database ER Diagram

This file serves as a placeholder for your Entity-Relationship diagram image.

To use this:

1. Save your ER diagram image as `er_diagram.png` in this folder
2. The image will automatically be referenced in the README.md file

## Current ER Diagram

The diagram shows the following relationships:

- **users.user**: Core user entity with authentication details
- **user.userProfile**: Extended user details with skin information
- **products.product**: Product information owned by users
- **routines.routine**: Skincare routine definitions
- **routine.routinestep**: Individual steps within routines
- **routines.dailycompletion**: Tracking of completed routine steps
