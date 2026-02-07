<!-- Based on Readme template by OthneilDrew -->
<a id="readme-top"></a>


# Problem Addressed: Unifying Solutions

# Team Number 5 :
- Benjamin Hockley
- Ranjan Suwal
- Nathan Mitchell



<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![project_license][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]



<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/kaalxvairab/shoutout">
    <img width="200" height="200" alt="image" src="https://github.com/user-attachments/assets/cac94d22-631b-4cc1-bb2d-9c998998b6d4" />

  </a>

<h3 align="center">Shoutout</h3>

  <p align="center">
    Shoutout is a platform for colleagues to recognise each other's brilliance!
    <br />
    <a href="https://github.com/kaalxvairab/shoutout"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/kaalxvairab/shoutout">View Demo</a>
    &middot;
    <a href="https://github.com/kaalxvairab/shoutout/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    &middot;
    <a href="https://github.com/kaalxvairab/shoutout/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

Project Developed for the Hack the Diff hackathon at Cardiff Central Library!
<img width="2552" height="1332" alt="image" src="https://github.com/user-attachments/assets/2d0b6cbf-cc2b-4e59-acc1-0da6f9a6fd02" />



<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

* [![Next.js](https://img.shields.io/badge/Next.js-black?logo=next.js&logoColor=white)](#)
* [![React](https://img.shields.io/badge/React-%2320232a.svg?logo=react&logoColor=%2361DAFB)](#)
* [![Claude](https://img.shields.io/badge/Claude-D97757?logo=claude&logoColor=fff)](#)
* [![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-%2338B2AC.svg?logo=tailwind-css&logoColor=white)](#)
* [![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=fff)](#)
* [![Postgres](https://img.shields.io/badge/Postgres-%23316192.svg?logo=postgresql&logoColor=white)](#)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Use the website.

The platform is live at : https://shoutout-hackdiff.vercel.app/

Feel free to test it and let us know your thoughts!

## Run the Project Locally

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [npm](https://www.npmjs.com/) (comes with Node.js)
- A [Supabase](https://supabase.com/) project
- A [Resend](https://resend.com/) account (for email notifications)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd shoutout
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the `shoutout` root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
RESEND_API_KEY=<your-resend-api-key>
RESEND_FROM_EMAIL=<your-verified-sender-email>
```

You can find your Supabase URL and anon key in your [Supabase dashboard](https://supabase.com/dashboard/project/_/settings/api) under **Project Settings → API**.

### 4. Set up the Supabase database

1. Go to your [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql)
2. Run the SQL migrations located in the `supabase/` directory (if present), or manually create the required tables for users, shoutouts, and leaderboard data

### 5. Run the development server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### 6. Build for production

```bash
npm run build
npm start
```


<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

Use this project in your company, so that employees can recognise each other's contributions and award their excellence.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap

- 07/02/2026 : Hack the Diff Hackathon. Initial version of shoutout completed and deployed!

See the [open issues](https://github.com/kaalxvairab/shoutout/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Top contributors:

<a href="https://github.com/kaalxvairab/shoutout/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=kaalxvairab/shoutout" alt="contrib.rocks image" />
</a>

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* [Hack the diff](https://www.linkedin.com/company/hack-the-diff/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/kaalxvairab/shoutout.svg?style=for-the-badge
[contributors-url]: https://github.com/kaalxvairab/shoutout/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/kaalxvairab/shoutout.svg?style=for-the-badge
[forks-url]: https://github.com/kaalxvairab/shoutout/network/members
[stars-shield]: https://img.shields.io/github/stars/kaalxvairab/shoutout.svg?style=for-the-badge
[stars-url]: https://github.com/kaalxvairab/shoutout/stargazers
[issues-shield]: https://img.shields.io/github/issues/kaalxvairab/shoutout.svg?style=for-the-badge
[issues-url]: https://github.com/kaalxvairab/shoutout/issues
[license-shield]: https://img.shields.io/github/license/kaalxvairab/shoutout.svg?style=for-the-badge
[license-url]: https://github.com/kaalxvairab/shoutout/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/linkedin_username
[product-screenshot]: images/screenshot.png

