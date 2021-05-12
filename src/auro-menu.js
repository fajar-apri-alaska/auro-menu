// Copyright (c) 2021 Alaska Airlines. All right reserved. Licensed under the Apache-2.0 license
// See LICENSE in the project root for license information.

// ---------------------------------------------------------------------

import "@alaskaairux/auro-icon";
import './auro-menu-option';

import { LitElement, html, css } from "lit-element";

// Import touch detection lib
import "focus-visible/dist/focus-visible.min.js";
import styleCss from "./style-css.js";

// See https://git.io/JJ6SJ for "How to document your components using JSDoc"
/**
 * auro-menu provides users a way to select one option from a pre-defined list of options
 * 
 * @attr {Array} options - Array of auro-menu-option nodes.
 * @attr {Boolean} isHidden - If the auro-menu is currently being shown or hidden, perhaps because auro-dropdown is controlling whether or not auro-menu is visible or hidden.
 * @attr {Number} indexSelectedOption - Index of the currently selected option.
 * @slot listOfOptions - Slot for the auro-menu-option nodes.
 */

class AuroMenu extends LitElement {
  constructor() {
    super();

    this.isHidden = true;
    this.options = null;
  }

  static get properties() {
    return {
      options: { type: Array },
      isHidden: { type: Boolean, reflect: true },
      indexSelectedOption: { type: Number },
    };
  }

  static get styles() {
    return css`
      ${styleCss}
    `;
  }

  firstUpdated() {
    const parentIndexSelectedOption = parseInt(this.parentElement.getAttribute('indexSelectedOption'), 10);
    
    // auro-menu is the child of a parent with an indexSelectedOption attribute
    if (!this.indexSelectedOption ) {
      if (parentIndexSelectedOption >= 0) {
        this.indexSelectedOption = parentIndexSelectedOption;
      } else {
        this.indexSelectedOption = 0;
      }
    }

    this.options = this.shadowRoot.querySelector('slot[name=listOfOptions]').assignedNodes();

    this.options.forEach((option, i) => {
      option.setAttribute('index', i);
      if (this.indexSelectedOption === i) {
        option.setAttribute('selected', '');
      } else {
        option.removeAttribute('selected');
      }
    });

    const dispatchEventOptionSelected = (optionSelected) => {
      // lets a parent component, perhaps auro-dropdown, that an option was selected
      optionSelected.dispatchEvent(new CustomEvent('optionSelected', {
        bubbles: true,
        cancelable: false,
        composed: true,
        detail: {
          index: optionSelected.getAttribute('index'),
          value: optionSelected.getAttribute('data-value'),
          displayText: optionSelected.innerText,
        }
      }));

      // go through each option <li> and if it is the same index as the option that was selected
      // mark it as selected, else unmark it as selected
      this.options.forEach((option, i) => {
        if (parseInt(optionSelected.getAttribute('index')) === i) {
          option.setAttribute('selected', '');
          this.indexSelectedOption = optionSelected.getAttribute('index');
        } else {
          option.removeAttribute('selected');
        }
      });
    }

    const funcFocus = (evt) => {
      evt.setAttribute('hasfocus', '')
    }
    const funcBlur = (evt) => {
      evt.removeAttribute('hasfocus')
    }

    const funcMouseOver = (evt) => {
      evt.setAttribute('beingMouseOvered', '')
    }
    const funcMouseOut = (evt) => {
      evt.removeAttribute('beingMouseOvered')
    }

    const handleKeyDown = (evt) => {
      if (evt.key.toLowerCase() === 'enter' || evt.key.toLowerCase() === ' ') {
        dispatchEventOptionSelected(evt.target);
      }

      // if user tabs off of last li, send a custome event 'hideOptionsContainer' to parent component
      if (evt.key.toLowerCase() === 'tab' && !evt.shiftKey && parseInt(evt.target.getAttribute('index')) === this.options.length -1) {
        evt.target.dispatchEvent(new CustomEvent('hideOptionsContainer', {
          bubbles: true,
          cancelable: false,
          composed: true,
        }));
      }

      if (evt.key.toLowerCase() === 'arrowdown') {
        if (parseInt(evt.target.getAttribute('index')) === this.options.length - 1) {
          this.options[0].focus();
        } else {
          this.options[parseInt(evt.target.getAttribute('index')) + 1].focus();
        }
      }

      if (evt.key.toLowerCase() === 'arrowup') {
        if (parseInt(evt.target.getAttribute('index')) === 0) {
          this.options[this.options.length - 1].focus();
        } else {
          this.options[parseInt(evt.target.getAttribute('index')) - 1].focus();
        }
      }
    };

    // Prep each <li>. Give it an index, set its tabindex to -1, add 'keydown' and 'click' event listeners, inject a checkmark auro-icon
    for (let i = 0; i < this.options.length; i += 1) {

      // each option is tabbable
      this.options[i].setAttribute('tabindex', '0');
      this.options[i].addEventListener('keydown', (evt) => handleKeyDown(evt));
      this.options[i].addEventListener('click', (evt) => dispatchEventOptionSelected(evt.target));

      this.options[i].addEventListener('focus', (evt) => funcFocus(evt.target));
      this.options[i].addEventListener('blur', (evt) => funcBlur(evt.target));
      this.options[i].addEventListener('mouseover', (evt) => funcMouseOver(evt.target));
      this.options[i].addEventListener('mouseout', (evt) => funcMouseOut(evt.target));
    }
  }

attributeChangedCallback(name, oldVal, newVal) {
  if (name.toLowerCase() === 'ishidden' && this.options) {
    if (newVal === null) {
      for (let i = 0; i < this.options.length; i++) {
        this.options[i].setAttribute('tabindex', 0);
      }
    } else {
      for (let i = 0; i < this.options.length; i++) {
        this.options[i].setAttribute('tabindex', -1);
      }    }
  }

  super.attributeChangedCallback(name, oldVal, newVal);
}

  render() {
    return html`
      <ul>
        <slot name="listOfOptions"></slot>
      </ul>
    `;
  }
}

/* istanbul ignore else */
// define the name of the custom component
if (!customElements.get("auro-menu")) {
  customElements.define("auro-menu", AuroMenu);
}
