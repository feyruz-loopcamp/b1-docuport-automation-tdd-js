import {test} from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { HomePage } from '../../pages/HomePage';
import { testBase, expect, CommonUI, testLoggedIn } from '../../utilities/docuport-ui-utilities';
import { appInfo } from '../../utilities/beta-data-reader';
import { log } from 'node:console';


test ('Test 1 - Login with hard coded values without POM', {tag: '@test1'}, async ({page}) => {
    await page.goto('https://beta.docuport.app/login');
    await page.locator("//label[text()='Username or email']").fill("b1g2_client@gmail.com");
    await page.locator("//label[text()='Password']").fill("Group2");
    await page.locator("//button[@type='submit']").click(); 
    await page.locator("//span[text()=' Continue ']").click(); 
    await expect(page.locator("//div[@class='v-avatar primary']")).toBeVisible();
    //await page.waitForTimeout(3000);
})


test ('Test 2 - Login with hard coded values with POM', {tag: '@test2'}, async ({page}) => {
    // Create a login page object to be able to use members (variables, methods) of that page
    const loginPage = new LoginPage(page); 
    const homePage = new HomePage(page);

    await page.goto('https://beta.docuport.app/login');
    await loginPage.enterUsername("b1g2_client@gmail.com"); 
    await loginPage.enterPassword("Group2");
    await loginPage.clickLoginButton(); 
    await homePage.clickContinueButton(); 
    await expect(homePage.profileIconButton).toBeVisible(); 
    //await page.waitForTimeout(4000);

})


test ('Test 3 - Login with hard coded values with POM with single login method ', {tag: '@test3'}, async ({page}) => {   
    // Create a login page object to be able to use members (variables, methods) of that page
    const loginPage = new LoginPage(page); 
    const homePage = new HomePage(page);

    await page.goto('https://beta.docuport.app/login');
    await loginPage.login("b1g2_client@gmail.com", "Group2"); 
    await homePage.clickContinueButton(); 
    await expect(homePage.profileIconButton).toBeVisible(); 
    //await page.waitForTimeout(4000);

})


// Storing data in JS object - works with KEY and VALUE
const credentials = {
    // KEY:   "VALUE"
    username: "b1g2_client@gmail.com",
    password: "Group2"
}

test ('Test 4 - Login with data from a JS Object ', {tag: '@test4'}, async ({page}) => {   
    // Create a login page object to be able to use members (variables, methods) of that page
    const loginPage = new LoginPage(page); 
    const homePage = new HomePage(page);

    await page.goto('https://beta.docuport.app/login');
    await loginPage.login(credentials.username, credentials.password); 
    await homePage.clickContinueButton(); 
    await expect(homePage.profileIconButton).toBeVisible(); 
    //await page.waitForTimeout(4000);

})


test ('Test 5 - Login as given user type', {tag: '@test5'}, async ({page}) => {   
    // Create a login page object to be able to use members (variables, methods) of that page
    const loginPage = new LoginPage(page); 
    const homePage = new HomePage(page);

    //await page.goto('https://beta.docuport.app/login');
    await loginPage.navigateToLoginPage(); 

    //await loginPage.login(credentials.username, credentials.password); 
    loginPage.loginAs("employee");
    //await homePage.clickContinueButton(); 
    await expect(homePage.profileIconButton).toBeVisible(); 
    await page.waitForTimeout(2000);
    await homePage.validatePageFor("employee");
})


// In terms of ROLE: what is my test data - Advisor, Client, Supervisor, Employee
test ('Test 6 - Login as any given user type', {tag: '@test6'}, async ({page}) => {   
    // Create a login page object to be able to use members (variables, methods) of that page
    const loginPage = new LoginPage(page); 
    const homePage = new HomePage(page);

    //await page.goto('https://beta.docuport.app/login');
    await loginPage.navigateToLoginPage(); 

    //await loginPage.login(credentials.username, credentials.password); 
    await loginPage.loginAs("Manager");
    await homePage.clickContinueButton(); 
    await expect(homePage.profileIconButton).toBeVisible(); 
    await page.waitForTimeout(2000);
})



// The default "test" from plawright will ONLY open BROWSER
//test ('Test 7 - Login as any given user type', {tag: '@test7'}, async ({page}) => {   
//    await page.waitForTimeout(2000);
//})

// The "testBase" we customized for our applicatin is using default "test" from playwrihgt and built our cust step on top of it. 
testBase ('Test 7 - Client left menut validation', {tag: '@test7'}, async ({page}) => {   
    const homePage = new HomePage(page);
    const role = "employee"

    await CommonUI.loginAs(page, role);
    const actualUiMenuItems = await homePage.getLeftMenuItems();  // comes from actual UI
    const expectedMenuItems = CommonUI.getLeftMenuFor(role);  // comes from tst data     
    console.log(actualUiMenuItems);
    console.log(expectedMenuItems);
    expect(actualUiMenuItems).toEqual(expectedMenuItems); 
    await CommonUI.logout(page); 

})


for (const eachRol of appInfo.roles) {

    testBase (`Test 8 - Each Role ${eachRol} left menu validation`, {tag: '@test8'}, async ({page}) => {   
        const homePage = new HomePage(page);
        //const role = "employee"

        await CommonUI.loginAs(page, eachRol);
        const actualUiMenuItems = await homePage.getLeftMenuItems();    // comes from actual UI
        const expectedMenuItems = CommonUI.getLeftMenuFor(eachRol);     // comes from tst data     
        //console.log(actualUiMenuItems);
        //console.log(expectedMenuItems);
        expect(actualUiMenuItems).toEqual(expectedMenuItems); 
        await CommonUI.logout(page); 
    })
}




/*
    * HOME WORK
        Create ProfilePage - POM
        Extedn BasePage
        Lcoate all related elements in there
        May be make some reusable method for the page
            - Update first name
            - Update last name
            - Update phone number
        Add some static method in CommonUi as well. 
        
        Create a test to validate if ProfilePage - emailAddress and userName is disbaled 
*/



testLoggedIn('Test 9 - Client starts already logged in', {tag: '@test9'}, async ({loggedInPage}) => {   
     const homePage = new HomePage(loggedInPage);
     await expect (homePage.profileIconButton).toBeVisible(); 
})


// There are mutiple tests that is all about "advisor" role 
testLoggedIn.describe("Advisor role related tests", () => {
    // this following line of a code, has to be declared only ONE time
    testLoggedIn.use({role: "advisor"});


    testLoggedIn('Test 10 - Advisor starts already logged in .....',{tag: '@test10'}, async ({loggedInPage}) => {
        const homePage = new HomePage(loggedInPage);
        await expect (homePage.profileIconButton).toBeVisible(); 
        await loggedInPage.waitForTimeout(3000);
    });


    // * Multiple different test can be created inside of this describe but all of the test will be logging in as ADVISOR 
    testLoggedIn('Test 11 - Advisor starts already logged in .....',{tag: '@test10'}, async ({loggedInPage}) => {
        const homePage = new HomePage(loggedInPage);
        await homePage.validatePageFor("advisor");
        await loggedInPage.waitForTimeout(3000);
    });


}); 

/*
    username    | password  | message
    invalid     | invalid   | Username or password is incorrect
    ""          | invalid   | Please enter your username or email address
    invalid     | ""        | 
    ""          | ""        | Please enter your username or email address
*/

//DATA - one array that holds multipl eobjects whihc each of the objects hols 3 KEY : VALUE
const invalidLogins = [
    {username: "invalid@gmail.com", password: "invalid123!", message: "Username or password is incorrect"},
    {username: "",                  password: "invalid123!", message: "Please enter your username or email address"},
    {username: "invalid@gmail.com", password: "",            message: "Please enter your password"},
    {username: "",                  password: "",            message: "Please enter your username or email address"}
];

for (const eachRow of invalidLogins) {

    testBase (`Test 12 - Invalid login for ${eachRow.username} and ${eachRow.password}}`, {tag: '@test12'}, async ({page}) => {   
        const loginPage = new LoginPage(page); 
        loginPage.login(eachRow.username, eachRow.password);
        await page.waitForTimeout(3000);
        await loginPage.verifyInvalidLoginMessage(eachRow.message); 

    })
}


for (const eachRow of appInfo.invalidLogins) {
    testBase (`Test 13 - Invalid login for ${eachRow.username} and ${eachRow.password}}`, {tag: '@test13'}, async ({page}) => {   
        const loginPage = new LoginPage(page); 
        loginPage.login(eachRow.username, eachRow.password);
        await page.waitForTimeout(3000);
        await loginPage.verifyInvalidLoginMessage(eachRow.message); 

    })
}



















