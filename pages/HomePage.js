import { BasePage } from "./BasePage";
import { expect} from '@playwright/test';


export class HomePage extends BasePage{
    
    // ! Sicne we are extending BasePage, we do not need the construtor to initialize the Elements, we can call locator() method in BasePage 
    // ! Since there INHERITANCE and no constructor in Child, it will use PARENT class constructor
    /*
    constructor (page) {
        this.page = page; 

        // LOCATORS for HOMEPAGE 
        this.homeContiueButton = this.page.locator("//span[text()=' Continue ']"); 
        this.profileIconButton = this.page.locator("//div[@class='v-avatar primary']"); 
         // TODO: HOMEWORK - > Locate all the other elements in LoginPage
    }
    */

    homeContinueButton = this.locator("//span[text()=' Continue ']"); 
    profileIconButton = this.locator("//div[@class='v-avatar primary']"); 
    selfOption = this.locator("//span[text()='Profile']");
    roleElem = this.locator("((//div[@class='d-page__content']//div[@class='row my-0'])[1]//div)[4]")
    leftMenuItems = this.locator("//div[@class='menu mr-2']//span[contains(@class,'subtitle-2') or contains(@class,'body-1')]"); 



    async clickContinueButton () {
        await this.homeContinueButton.click(); 
    }

    async validatePageFor (role) {
        await this.profileIconButton.click();
        await this.selfOption.click();
        const actualText = await this.roleElem.innerText();
        // This is hte line where it is validated 
        //await this.page.waitForTimeout(4000);
        expect (actualText.toLowerCase()).toBe(role.toLowerCase()); 
    }

    async getLeftMenuItems (){
        const texts = await this.leftMenuItems.allInnerTexts(); 
        return texts.map(eachText => eachText.trim()); 
    }

}