*** Settings ***
Resource    common.robot

Test Setup    Open Greyboard With Logged In User
Test Teardown    Close Greyboard

Suite Setup    Create Test User
Suite Teardown    Close All Browsers


*** Test Cases ***
Open Page
    [Documentation]    Tests if the web application opens or not.
    [Tags]    positive

    Log    "Page opened"


Open Dashboard
    [Documentation]    Tests if the user can open the dashboard from the home page.
    [Tags]    positive

    Click Button With Text    Go to my Dashboard
    Wait Until Location Contains    /dashboard
    Wait Until Page Contains    Greyboard Tester


Log Out From Home Page
    [Documentation]    Tests if the user can log out from the home page.
    [Tags]    positive
    
    Navigate To    /
    Click Button With Text    Log out
    Wait Until Page Contains    Sign in with...

Log Out From Dashboard
    [Documentation]    Tests if the user can log out from the dashboard page.
    [Tags]    positive
    
    Navigate To    /dashboard
    Click Element With Text    p    Greyboard Tester
    Click Element With Text    p    Log out
    Wait Until Location Does Not Contain    /dashboard
    Wait Until Page Contains    Sign in with...