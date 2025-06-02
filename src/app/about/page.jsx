import React from "react";
import HeroImage from "../components/HeroImage/HeroImage";
import AboutMe from "../components/AboutMe/AboutMe";
import Skills from "../components/Skills/Skills";
import styles from "./About.css"; // Optional für allgemeine Stile

export default function About() {
  return (
    <div className="aboutcssPage">
      <AboutMe />
      <Skills />
    </div>
  );
}
