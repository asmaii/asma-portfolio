import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
window.gsap = gsap;
window.ScrollTrigger = ScrollTrigger;
import './main.css';
import './styles.css';
import './script.js';
window.addEventListener('load', () => document.body.classList.remove('is-loading'));
