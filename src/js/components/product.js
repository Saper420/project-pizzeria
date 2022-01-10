import { select , classNames , templates} from '../settings.js';
import { utils } from '../utils.js';
import AmountWidget from './amountWidget.js';

class Product{
  constructor(id, data){
    const thisProduct = this;
    thisProduct.id = id;
    thisProduct.data = data;
    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
  }
  renderInMenu(){
    const thisProduct = this;
    const generatedHTML = templates.menuProduct(thisProduct.data);
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    const menuContainer = document.querySelector(select.containerOf.menu);
    menuContainer.appendChild(thisProduct.element);
  }
  getElements(){
    const thisProduct = this;
    
    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }
  initAccordion(){
    const thisProduct = this;
    const wrapper = thisProduct.element;
    thisProduct.accordionTrigger.addEventListener('click', function(event){
      event.preventDefault();
      const activeWrap = document.querySelector(select.all.menuProductsActive);      
      if(activeWrap && activeWrap != wrapper){
        activeWrap.classList.remove('active');
      }
      wrapper.classList.toggle('active');
    });
  }
  initOrderForm(){
    const thisProduct = this;
    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });
      
    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }
      
    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }
  processOrder(){
    const thisProduct = this;
    const formData = utils.serializeFormToObject(thisProduct.form);
    let price = thisProduct.data.price;
    for(let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];
      for(let optionId in param.options) {
        const option = param.options[optionId];
        const costam = '.'+ thisProduct.data.params[paramId].label.toLowerCase() +'-' + optionId;
        const image = document.querySelector(costam);
        if(formData[paramId] && formData[paramId].includes(optionId)) {
          if(!option.default) {
            price = price + option.price;
          }
          if(image){
            image.classList.add(classNames.menuProduct.imageVisible);
          }
        } else {
          if(option.default) {
            price = price - option.price;              
          }
          if(image){
            image.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }
    thisProduct.priceSingle = price;
    price *= thisProduct.amountWidget.value;
    thisProduct.prices = price;
    thisProduct.priceElem.innerHTML = price;
  }
  initAmountWidget(){
    const thisProduct = this;
    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
      
  }
  addToCart(){
    const thisProduct = this;
    //app.cart.add(thisProduct.prepareCartProduct());
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail :{
        product: thisProduct.prepareCartProduct()
      }
    });
    thisProduct.element.dispatchEvent(event);
  }
  prepareCartProductParams() {
    const thisProduct = this;  
    const formData = utils.serializeFormToObject(thisProduct.form);
    const params = {};
    for(let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];
      params[paramId] = {
        label: param.label,
        options: {}
      };
      for(let optionId in param.options) {
        const option = param.options[optionId];
        if(formData[paramId] && formData[paramId].includes(optionId)){
          params[paramId].options[optionId] = option.label;
        }
      }
    }  
    return params;
  }
  prepareCartProduct(){      
    const thisProduct = this;
    const productSummary = {
      id: thisProduct.id,
      name: thisProduct.data.name,
      amount: thisProduct.amountWidget.value,
      priceSingle: thisProduct.priceSingle,
      price: thisProduct.prices,
      params: thisProduct.prepareCartProductParams()
    };
      
      
    return productSummary;
  }
}

export default Product;