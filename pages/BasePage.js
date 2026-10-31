export class BasePage {
    // ! This has become the PARENT class - so all fields and methods can be INHERITED to CHILD classes 
    constructor(page) {
        // Preventing creating object of BasePage 
        if (new.target === BasePage){
            throw new Error ("BasePage cannot be instantiated directly")
        }

        this.page = page; 
    }


    // This will help us to initialize elmenets 
    locator(selector) {
        return this.page.locator(selector); 
    }


}