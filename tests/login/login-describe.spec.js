import { testBase, expect, CommonUI } from '../../utilities/docuport-ui-utilities';
import { LoginPage } from '../../pages/LoginPage';
import { HomePage } from '../../pages/HomePage';

testBase.describe ("Login - describe - beforeEach", () => {

    let loginPage;
    let homePage;

    // .beforeEach will be executed before each test 
    testBase.beforeEach (async({page}) => {
        loginPage = new LoginPage (page)
        homePage = new HomePage (page); 
    })


    testBase("Client Login", {tag : "@smoke"},  async() => {
        //const loginPage = new LoginPage (page); 
        await loginPage.loginAs("client"); 
        //const homePage = new HomePage (page); 
        await homePage.validatePageFor("client"); 
    })



    testBase("Advisor Login", {tag : "@smoke"},  async() => {   
        //const loginPage = new LoginPage (page); 
        await loginPage.loginAs("advisor"); 
        //const homePage = new HomePage (page); 
        await homePage.validatePageFor("advisor");       
    })


});

// ! BE BACK 9:15

