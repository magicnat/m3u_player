HTMLElement.prototype.removeAttributeItem = function (attr, item) {
	/* this is bad. cuz it simply removes the string. 
         * i.e. if you do removeAttributeItem('class', 'a') on a element
         * <div class="apple banana"></div> you will get:
         * <div class="pp;e bnn"></div>
         * However it is good enought for me to use, so...
         * WHO CARES?
         */
	this.setAttribute(attr, this.getAttribute(attr).replace(item, ''));
};
