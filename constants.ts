
import { Course, ModuleType } from './types';

export const COURSE_DATA: Course = {
  title: '6-Week HTML, CSS, & JavaScript Crash Course',
  description: 'Your journey to becoming a web developer starts here. Learn the foundational skills of modern web development in just six weeks.',
  weeks: [
    {
      title: 'Week 1: HTML Fundamentals',
      description: 'Build a strong foundation by learning the essential structure and elements of HTML, the backbone of all websites.',
      modules: [
        { 
          title: 'Introduction to Web Development', 
          type: ModuleType.Lesson, 
          description: 'Get a high-level overview of how websites work, from servers to browsers, and understand the roles of HTML, CSS, and JavaScript.',
          content: 'Welcome to the world of web development! In this lesson, we will explore the fundamental concepts that power the internet. You will learn about the client-server model, what happens when you type a URL into your browser, and how HTML, CSS, and JavaScript work together to create the rich web experiences you use every day. This foundational knowledge is key to becoming a successful developer.' 
        },
        { 
          title: 'Setting Up Your Editor', 
          type: ModuleType.Video, 
          description: 'A step-by-step guide to installing and configuring Visual Studio Code for web development.',
          content: 'sptX2DkkM7w' 
        },
        { 
          title: 'HTML Document Structure', 
          type: ModuleType.Lesson, 
          description: 'Learn about the core elements of an HTML document like `<!DOCTYPE>`, `<html>`, `<head>`, and `<body>`.',
          content: 'Every HTML page has a standard structure. We will dissect a basic HTML file to understand the purpose of each essential tag. You will learn how the `<head>` tag holds metadata like the page title and links to stylesheets, while the `<body>` tag contains all the visible content.' 
        },
        { 
          title: 'Exercise: Create Your First HTML Page', 
          type: ModuleType.Exercise, 
          description: 'Apply your knowledge by building a simple, structured personal bio page from scratch.',
          content: 'Time to get your hands dirty! Following the structure you just learned, create a new HTML file. Add the necessary doctype, html, head, and body tags. Inside the head, give your page a title. Inside the body, add a main heading (h1) and a paragraph (p) introducing yourself. This is the first step to building your own website!' 
        },
        {
          title: 'Quiz: HTML Basics',
          type: ModuleType.Quiz,
          description: 'Test your understanding of the fundamental HTML concepts covered this week.',
          content: 'This short quiz will cover topics like the roles of HTML, CSS, and JS, the function of the doctype, and the difference between the `<head>` and `<body>` elements.'
        },
        {
          title: 'Assignment: Personal Bio Page',
          type: ModuleType.Assignment,
          description: 'Expand your bio page by adding more elements and structure.',
          content: 'Build upon your first exercise. Add subheadings for "Hobbies" and "Contact Info". Use unordered lists `<ul>` for your hobbies and ordered lists `<ol>` for step-by-step instructions on how to contact you. This assignment will test your ability to structure content meaningfully.'
        }
      ],
    },
    {
      title: 'Week 2: Advanced HTML',
      description: 'Dive deeper into HTML to handle links, images, tables, and forms, making your web pages more interactive and data-rich.',
      modules: [
        { 
          title: 'Creating Links and Navigation', 
          type: ModuleType.Lesson, 
          description: 'Learn how to connect pages using the anchor `<a>` tag and create navigation menus.',
          content: 'The web is built on connections. The anchor tag `<a>` is the key to linking your pages together. We will cover how to create links to other pages on your site (relative links) and to external sites (absolute links). You will also learn how to make links open in a new tab.' 
        },
        { 
          title: 'Working with Images', 
          type: ModuleType.Lesson, 
          description: 'Embed images into your web pages using the `<img>` tag and its essential attributes like `src` and `alt`.',
          content: 'A picture is worth a thousand words. The `<img>` tag lets you add visual elements to your site. We will discuss the importance of the `src` attribute to point to the image file and the crucial `alt` attribute for accessibility.' 
        },
        { 
          title: 'HTML Forms for User Input', 
          type: ModuleType.Lesson, 
          description: 'Create interactive forms to collect user input with elements like `<form>`, `<input>`, and `<button>`.',
          content: 'Forms are the primary way to gather information from your users. We will explore different input types like text, password, email, and checkbox. You will learn how to wrap them in a `<form>` element and add a submit button to send the data.' 
        },
        { 
          title: 'Exercise: Build a Contact Form', 
          type: ModuleType.Exercise, 
          description: 'Create a functional contact form with fields for name, email, and a message.',
          content: 'Practice what you have learned by building a contact form for your bio page. Include a text input for the name, an email input for the email address, a textarea for the message, and a submit button. Dont worry about making it functional yet; focus on the HTML structure.' 
        },
        {
          title: 'Quiz: Links, Images, & Forms',
          type: ModuleType.Quiz,
          description: 'Check your knowledge of creating hyperlinks, embedding images, and structuring forms.',
          content: 'This quiz will ask about `<a>` tag attributes, the purpose of `alt` text for images, and how to use different `<input>` types.'
        },
        {
          title: 'Assignment: Build a Recipe Page',
          type: ModuleType.Assignment,
          description: 'Create a detailed recipe page that includes a title, an image of the dish, a list of ingredients, and step-by-step instructions.',
          content: 'This project combines everything you have learned so far. Your recipe page should have a main heading, a mouth-watering image, an unordered list for ingredients, and an ordered list for the cooking instructions. Bonus: Add a link to the original source of the recipe.'
        }
      ],
    },
    {
      title: 'Week 3: Introduction to CSS',
      description: 'Learn the fundamentals of CSS to add style, color, and typography to your HTML, transforming plain documents into beautiful designs.',
      modules: [
        { 
          title: 'What is CSS?', 
          type: ModuleType.Lesson, 
          description: 'Discover how CSS (Cascading Style Sheets) adds style to your HTML and the three ways to include it in your project.',
          content: 'CSS is the language we use to style an HTML document. We will discuss the concept of "cascading" and explore the three methods of applying CSS: inline styles, internal stylesheets using `<style>` tags, and external stylesheets using `<link>` tags, which is the best practice.' 
        },
        { 
          title: 'Selectors, Properties, and Values', 
          type: ModuleType.Lesson, 
          description: 'Understand the basic syntax of CSS, including how to target elements with selectors and apply styles with properties and values.',
          content: 'The core of CSS is its syntax: `selector { property: value; }`. We will break this down, covering different types of selectors (element, class, ID) and common properties like `color`, `font-size`, and `background-color`.' 
        },
        { 
          title: 'The Box Model', 
          type: ModuleType.Lesson, 
          description: 'Master the fundamental concept of the CSS Box Model, understanding margin, border, padding, and content.',
          content: 'Every element on a web page is a rectangular box. The CSS box model is the set of rules that defines how this box is structured. We will explore the different layers—content, padding, border, and margin—and how they affect layout and spacing.' 
        },
        { 
          title: 'Your First Stylesheet', 
          type: ModuleType.Video, 
          description: 'Follow along to create and link an external stylesheet to your HTML page, adding your first custom styles.',
          content: '1PnVor36_40' 
        },
        {
          title: 'Quiz: CSS Fundamentals',
          type: ModuleType.Quiz,
          description: 'Test your grasp of CSS syntax, selectors, and the box model.',
          content: 'This quiz will cover the parts of a CSS rule, the difference between class and ID selectors, and how margin and padding affect an element.'
        },
        {
          title: 'Assignment: Style Your Bio Page',
          type: ModuleType.Assignment,
          description: 'Apply your new CSS knowledge to style the Personal Bio Page you created in Week 1.',
          content: 'It is time to make your bio page look great! Create an external stylesheet and link it to your HTML. Use CSS to: change the background color of the page, set a different font for your headings and paragraphs, and add some padding and margins to create better spacing. Get creative!'
        }
      ],
    },
    {
      title: 'Week 4: Advanced CSS Layouts',
      description: 'Move beyond basic styling and learn modern CSS layout techniques like Flexbox and Grid to build complex, responsive websites.',
      modules: [
        { 
          title: 'Flexbox for 1D Layouts', 
          type: ModuleType.Lesson, 
          description: 'Learn how to create flexible and powerful single-axis layouts with CSS Flexbox.',
          content: 'Flexbox is a layout model designed for arranging items in a single dimension (a row or a column). We will cover the main concepts, including the flex container and flex items, and properties like `display: flex`, `justify-content`, and `align-items` to control alignment and spacing.' 
        },
        { 
          title: 'CSS Grid for 2D Layouts', 
          type: ModuleType.Lesson, 
          description: 'Master two-dimensional layouts, perfect for entire page structures, with the powerful CSS Grid module.',
          content: 'CSS Grid is a two-dimensional layout system, meaning it can handle both columns and rows. It is perfect for creating the main layout of your website. We will explore `display: grid`, `grid-template-columns`, `grid-template-rows`, and how to place items onto the grid.' 
        },
        { 
          title: 'Responsive Design with Media Queries', 
          type: ModuleType.Lesson, 
          description: 'Learn how to use media queries to apply different styles for different screen sizes, making your websites look great on all devices.',
          content: 'In todays world, users browse on phones, tablets, and desktops. Responsive design is essential. Media queries are the tool that makes it possible. You will learn how to write CSS rules that only apply when certain conditions, like screen width, are met.' 
        },
        {
          title: 'Quiz: Modern CSS Layouts',
          type: ModuleType.Quiz,
          description: 'Assess your knowledge of Flexbox, Grid, and responsive design principles.',
          content: 'This quiz will challenge you on when to use Flexbox vs. Grid, the purpose of `justify-content`, and the syntax for writing a media query for mobile devices.'
        },
        {
          title: 'Assignment: Create a Responsive Photo Gallery',
          type: ModuleType.Assignment,
          description: 'Build a responsive image gallery using either CSS Flexbox or Grid.',
          content: 'Create an HTML page with a gallery of at least six images. Use CSS Grid or Flexbox to arrange the images in a grid. On large screens, it might be 3 columns. On smaller screens, it should collapse to 2 columns, and finally 1 column on mobile phones. This will require you to use media queries.'
        }
      ],
    },
    {
      title: 'Week 5: JavaScript Fundamentals',
      description: 'Bring your websites to life by learning the basics of JavaScript, the programming language of the web.',
      modules: [
        { 
          title: 'Introduction to JavaScript', 
          type: ModuleType.Lesson, 
          description: 'Understand the role of JavaScript in web development and learn how to include it in your pages.',
          content: 'JavaScript is what makes websites interactive. From simple animations to complex web applications, JS does it all. We will discuss its role as the "brains" of a webpage and how to add it to your HTML using the `<script>` tag.' 
        },
        { 
          title: 'Variables, Data Types, and Operators', 
          type: ModuleType.Lesson, 
          description: 'Learn the building blocks of the language: variables for storing data, different data types (strings, numbers, booleans), and operators for performing actions.',
          content: 'Before you can build complex logic, you need to understand the basics. This lesson covers how to declare variables with `let` and `const`, the different kinds of data you can work with, and how to use operators for math, comparison, and logic.' 
        },
        { 
          title: 'DOM Manipulation', 
          type: ModuleType.Lesson, 
          description: 'Learn how to use JavaScript to interact with and modify HTML and CSS elements on your page.',
          content: 'The Document Object Model (DOM) is a programming interface for web documents. JavaScript can use the DOM to access and manipulate the content, structure, and style of a document. You will learn how to select elements, change their text, and modify their styles.' 
        },
        { 
          title: 'Your First Script', 
          type: ModuleType.Video, 
          description: 'A guided tutorial on writing a simple JavaScript program that changes the content of an HTML element when a button is clicked.',
          content: 'W6NZfCO5eZE' 
        },
        {
          title: 'Quiz: JavaScript Basics',
          type: ModuleType.Quiz,
          description: 'Check your understanding of JavaScript variables, data types, and basic DOM manipulation.',
          content: 'This quiz will cover the difference between `let` and `const`, basic data types, and how to select an element from the DOM using its ID.'
        },
        {
          title: 'Assignment: Simple Click Counter',
          type: ModuleType.Assignment,
          description: 'Create a button that, when clicked, increments a counter displayed on the page.',
          content: 'Build an HTML page with a heading that says "Counter: 0" and a button that says "Click Me". Write JavaScript to select both elements. Add an event listener to the button so that every time it is clicked, the number in the heading increases by one. This will test your DOM manipulation and variable handling skills.'
        }
      ],
    },
    {
      title: 'Week 6: Final Project',
      description: 'Apply all the skills you have learned in HTML, CSS, and JavaScript to build a complete, interactive web application from scratch.',
      modules: [
        { 
          title: 'Project Planning & Structure', 
          type: ModuleType.Lesson, 
          description: 'Learn how to plan a web project, break it down into smaller tasks, and structure your files and folders.',
          content: 'Good planning is crucial for any project. We will discuss how to define the features of your application, sketch a simple wireframe, and organize your project with separate files for HTML, CSS, and JavaScript to keep your code clean and maintainable.' 
        },
        { 
          title: 'Final Project: Build a To-Do List App', 
          type: ModuleType.Exercise, 
          description: 'The final capstone project to apply all your skills by building a functional to-do list application.',
          content: 'This project will integrate everything. You will need to create the HTML structure for the to-do list (an input field, a button, and a list). You will style it with CSS to make it look good. Finally, you will use JavaScript to add the functionality: add new tasks to the list when the button is clicked, and mark tasks as complete when they are clicked.' 
        },
        { 
          title: 'Final Project Submission', 
          type: ModuleType.Assignment, 
          description: 'Submit your completed To-Do List App for review.',
          content: 'Package your final project files (HTML, CSS, JavaScript) and submit them here. Ensure your code is well-commented and the application is fully functional as per the project requirements.' 
        },
        { 
          title: 'Course Wrap-up and Next Steps', 
          type: ModuleType.Lesson, 
          description: 'Congratulations! You have completed the course. Discover where to go from here on your web development journey.',
          content: 'You have taken a huge step in your journey to becoming a web developer. We will review what you have accomplished and discuss potential next steps, such as learning a JavaScript framework like React, exploring backend development, or building your personal portfolio. The journey is just beginning!' 
        },
      ],
    },
  ],
};
