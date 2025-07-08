# prompt.me - AI Prompt Management Application

This repository contains the full project for **prompt.me**, a modern application for managing Generative AI prompts. The project is currently divided into two main parts.

## 1. Client-Side MVP (`/Prompt.me Client`)

This is a fully-featured, client-side application built with vanilla HTML, CSS, and JavaScript. It runs entirely in the browser, using `localStorage` for data persistence. This MVP was created to rapidly prototype the user interface, features, and overall user experience.

**It is the most up-to-date and functional part of the project.**

*   **To run this application, please see the instructions in [`/Prompt.me Client/HowTo.md`](/Prompt.me Client/HowTo.md).**
*   For a full list of its features, see [`/Prompt.me Client/README.md`](/Prompt.me Client/README.md).

## 2. Flask Backend Skeleton (`/backend` and `/templates`)

This section contains the foundational code for a future server-side version of the application, built with Python and Flask. The goal is to eventually migrate the functionality from the client-side MVP to this robust backend, enabling real user accounts, a central database, and true persistence.

*   **This part is currently a skeleton and is not fully functional.**
*   Setup instructions for this future version can be found in [`howto.md`](howto.md).

## Project Goal

The ultimate goal is to connect the powerful front-end interface from the Client-Side MVP with the scalable and secure backend architecture defined in the Flask skeleton.