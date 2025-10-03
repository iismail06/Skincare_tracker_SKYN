# SKYN - Skincare Tracker

A Django-based web application for tracking and managing skincare routines. SKYN helps users monitor their daily skincare products, track their skin's response over time, and receive personalized insights for better skincare management.

![SKYN Homepage](static/images/homepage-screenshot.png) <!-- Add screenshot later -->

## 🌟 Features

- **Routine Tracking**: Create and manage morning and evening skincare routines
- **Product Management**: Add and organize skincare products with detailed information
- **Progress Monitoring**: Track your skin's response to different products over time
- **User Authentication**: Secure user registration and login system
- **Responsive Design**: Optimized for desktop and mobile devices
- **Dark/Light Theme**: Toggle between light and dark modes for better user experience
- **Calendar Integration**: The dashboard features a calendar that highlights daily, weekly, and monthly routines. Clicking on highlighted days opens popups with detailed routine steps and product info.
- **User Profile & Questionnaire**: Includes a user profile page and a questionnaire to personalize recommendations and routine suggestions.
- **Progress Tracking**: Users can monitor routine completion and view historical data to track improvements in their skincare journey.
- **Other Dashboard Features**: Quick access to routine management, product overview, and user settings for streamlined navigation.

## 🚀 Live Demo

[View Live Application](your-deployed-url-here) <!-- Add when deployed -->

## 📚 User Stories

### First Time Visitor

- As a first-time visitor, I want to understand what SKYN does immediately upon landing
- As a new user, I want to easily create an account and start tracking my routine

### Registered User

- As a registered user, I want to create and manage my skincare routines
- As a user, I want to track my skin's response to different products
- As a user, I want to switch between light and dark themes for comfortable viewing

### Returning User

- As a returning user, I want to quickly access my existing routines
- As a user, I want to see my progress and skin improvements over time

## � Agile Development

This project was developed using Agile methodology with continuous iteration and user feedback integration.

### Project Management

- **GitHub Project Board**: [View Project Board](https://github.com/users/iismail06/projects/5/views/1)
- **Board Visibility**: Set to public for transparency and collaboration
- **Workflow Columns**: Backlog → Todo → In Progress → Done

### User Story Mapping

All user stories from the above section have been mapped to the GitHub project board as individual issues/items:

- ✅ **First-time visitor stories** - Mapped to onboarding and homepage features
- ✅ **Registered user stories** - Mapped to core CRUD functionality
- ✅ **Returning user stories** - Mapped to dashboard and progress tracking features

### Development Task Breakdown

Each user story has been broken down into specific development tasks:

- Database model design and implementation
- View and URL configuration
- Template creation and styling
- Form handling and validation
- Authentication and authorization
- API integration and testing

### Prioritization System (MoSCoW)

Features were prioritized using the MoSCoW method:

- **Must Have**: User authentication, basic CRUD operations, responsive design
- **Should Have**: Product search, routine tracking, user profiles
- **Could Have**: Progress analytics, social features, API integrations
- **Won't Have**: Advanced AI recommendations, mobile app (for this iteration)

## �🛠️ Technologies Used

- **Backend**: Django, Python
- **Frontend**: HTML5, CSS3, JavaScript
- **Database**: PostgreSQL,  SQLite (development)
- **Icons**: Font Awesome
- **Styling**: Custom CSS with CSS Variables for theming
- **Version Control**: Git & GitHub

## 📋 Installation & Setup

### Prerequisites

- Python 3.8+
- pip (Python package manager)

### Local Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/iismail06/Skincare_tracker_SKYN.git
   cd Skincare_tracker_SKYN
   ```

2. **Create virtual environment**

   ```bash
   python -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations**

   ```bash
   python manage.py migrate
   ```

5. **Create superuser (optional)**

   ```bash
   python manage.py createsuperuser
   ```

6. **Run development server**

   ```bash
   python manage.py runserver
   ```

7. **Access the application**
   - Open your browser and navigate to `http://127.0.0.1:8000`

## 🗂️ Project Structure

Skincare_tracker_SKYN/
├── config/                 # Django project settings
├── users/                  # User authentication app
├── routines/              # Skincare routines app (coming soon)
├── static/                # Static files (CSS, JS, images)
├── templates/             # HTML templates
├── requirements.txt       # Python dependencies
├── manage.py             # Django management script
└── README.md

## 🎨 Design & Styling

- **Color Palette**: Earthy tones with light (#e9e9e9) and dark (#3a2618) theme support
- **Typography**: Inter font family for modern, clean readability
- **Responsive**: Mobile-first design with standard breakpoints (600px, 768px, 992px, 1200px)
- **Accessibility**: High contrast ratios and semantic HTML structure

## 🧪 Testing

Testing documentation will be completed during the development phase.

| Test Area  | Description                                      | Status |
| ---------- | ------------------------------------------------ | ------ |
| **Models** | Check model creation, relationships, validations | ✅      |
| **Views**  | Test routine creation, listing, and detail pages | ✅      |
| **Forms**  | Ensure forms validate correctly                  | ✅      |
| **Auth**   | Test login/logout and registration               | ✅      |

## 🙏 Accreditations

### Images & Assets

- Hero section background image: [Pexels - Photo by Author Name](image-url)
- Features section image: [Pexels - Photo by Author Name](image-url)
- Favicon generated using: [Favicon.io](https://favicon.io/)

### Code Resources

- Django documentation: [docs.djangoproject.com](https://docs.djangoproject.com/)
- CSS Grid techniques: [CSS-Tricks Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- Font Awesome icons: [FontAwesome](https://fontawesome.com/)

### Design Inspiration

- Color palette inspired by modern skincare brand aesthetics
- Typography choices based on accessibility best practices

## 📖 Inspiration & Acknowledgments

This project was developed as a **learning exercise**. I combined ideas from multiple tutorials, blog posts, and online snippets, adapting them into a skincare routine tracker.

### Popups with Routine Details

- [Bootstrap Modal Tutorial (YouTube)](https://www.youtube.com/watch?v=Jyvffr3aCp0)
- [JavaScript Popups & Event Listeners (YouTube)](https://www.youtube.com/watch?v=K8Q4KX1Tu7w)

### Product Management (Add/Edit/Delete)

- [Django CRUD Tutorial (YouTube)](https://www.youtube.com/watch?v=F5mRW0jo-U4)
- [Django Admin & Forms (YouTube)](https://www.youtube.com/watch?v=UIpKQ7fSxkY)

### User Profile & Questionnaire

- [Django Custom User Model Tutorial (YouTube)](https://www.youtube.com/watch?v=Hshbjg5P4d4)
- [Django Forms & Validation (YouTube)](https://www.youtube.com/watch?v=UIpKQ7fSxkY)

#### Dashboard & Tracking Features

- [Django Dashboard Tutorial (YouTube)](https://www.youtube.com/watch?v=6WruncSoCdI)
- [JavaScript Dynamic Dashboard (YouTube)](https://www.youtube.com/watch?v=0ik6X4DJKCc)

### Calendar & JavaScript Tutorials

- [YouTube: JavaScript DOM Crash Course](https://www.youtube.com/watch?v=0ik6X4DJKCc) — Learn how to manipulate HTML and CSS with JavaScript.
- [MDN Web Docs: Introduction to Django](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Django/Introduction) — Django basics for beginners.
- [Real Python: Django Templates Tutorial](https://realpython.com/django-templates/) — How Django templates work and how to pass data from views to HTML.
- [YouTube: Django Forms Tutorial](https://www.youtube.com/watch?v=UIpKQ7fSxkY) — How to create and use forms in Django.
- [YouTube: JavaScript Event Listeners Explained](https://www.youtube.com/watch?v=jq4V6Iu6AmE) — How to handle clicks and other events in JS.
- [MDN Web Docs: Using Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) — How to send and receive data between JS and backend.

- [YouTube: Build a Calendar in JavaScript](https://www.youtube.com/watch?v=K8Q4KX1Tu7w) — Shows how to build and style a calendar, add events, and handle clicks.
- [YouTube: Django Calendar App Tutorial](https://www.youtube.com/watch?v=Q3u1n6b1xGk) — Shows how to pass data from Django to JS and display events.
- [MDN Web Docs: Manipulating documents with JavaScript](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Manipulating_documents) — Explains how to update HTML and add interactivity.

This skincare tracker demonstrates several fundamental Django concepts:

### API Implemented

- **REST API Endpoints** - Following [DRF Quickstart Guide](https://www.django-rest-framework.org/tutorial/quickstart/)
- **Custom Management Commands** - Based on [Django's official documentation](https://docs.djangoproject.com/en/5.2/howto/custom-management-commands/)
- **External API Integration** - Using patterns from [Real Python's API Integration Guide](https://realpython.com/api-integration-in-python/)
- **Model Extensions** - Standard Django model fields as shown in [Django Models Tutorial](https://docs.djangoproject.com/en/5.2/topics/db/models/)

### Learning Resources

If you want to understand or extend this code, these tutorials cover all the concepts used:

1. [Django REST Framework Tutorial Series](https://www.django-rest-framework.org/tutorial/1-serialization/) - For API development
2. [Real Python Django Series](https://realpython.com/get-started-with-django-1/) - For Django fundamentals
3. [Python Requests Documentation](https://requests.readthedocs.io/en/latest/) - For API calls

### Open Beauty Facts API

- [Open Beauty Facts API Documentation](https://world.openbeautyfacts.org/data)
- [API Usage Examples](https://wiki.openbeautyfacts.org/API)

## 🤖 AI Contribution  

- **Automated Testing**: AI was used to help structure and organize the test cases into logical sections.  
- *All AI-generated code was reviewed, understood, and modified by the developer to ensure learning objectives were met.*

## 🔧 Future Enhancements

- Product recommendation system based on skin type
- Progress photos and visual tracking
- Export routine data to PDF
- Social features for sharing routines
- Integration with skincare product databases

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Idil** - [GitHub Profile](https://github.com/iismail06)
