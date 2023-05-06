*** Settings ***
Library     String
Library     Selenium2Library

Test Setup    Open Greyboard With Logged In User
Test Teardown    Close Greyboard

Suite Teardown    Close All Browsers


*** Variables ***
${HOST}    %{RFW_HOST}
${TOKEN}    %{RFW_TOKEN}
${BROWSER}    %{RFW_BROWSER}
${USERNAME}    %{RFW_USERNAME}
${PASSWORD}    %{RFW_PASSWORD}


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

Log Out
    [Documentation]    Tests if the user can log out.
    [Tags]    positive
    Navigate To    /
    Click Button With Text    Log out
    Wait Until Page Contains    Sign in with...


*** Keywords ***
Open Greyboard
    Open Browser    ${HOST}    browser=${BROWSER}
    Wait Until Page Contains    Greyboard
    Wait Until Page Contains    A small online collaborative whiteboard application for mocking, wireframing, solving problems and sketching.

Open Greyboard With Logged In User
    Open Browser    ${HOST}    browser=${BROWSER}
    Add Cookie    jwtToken    ${TOKEN}
    Execute Javascript    window.localStorage.setItem('user', '{"id":"e0fd4b98-5f67-47eb-9d95-253f3dbd598b","name":"Greyboard Tester","email":"","avatar":"https://lh3.googleusercontent.com/a/AGNmyxZjd8E-sMJa3-kunNUw_UHOnHWqU919mRUQZlfP=s96-c","type":1,"createdAt":1683341538,"iat":1683368283}')
    Reload Page
    Wait Until Element With Text Is Visible    button    Go to my Dashboard

Navigate To
    [Arguments]    ${path}
    Go To    ${HOST}${path}

Click
    [Arguments]    ${xpath}
    Wait Until Element Is Enabled    xpath:${xpath}
    Wait Until Keyword Succeeds    5x    500ms    Click Element    xpath:${xpath}

Click Button With Text
    [Arguments]    ${text}
    Click    //button[normalize-space(.) = "${text}"]

Wait Until Element With Text Is Visible
    [Arguments]    ${element}    ${text}
    Wait Until Element Is Enabled    xpath://${element}\[normalize-space(.) = "${text}"]

Type Into
    [Arguments]    ${xpath}    ${text}
    Wait Until Element Is Visible    xpath:${xpath}
    Set Focus To Element    xpath:${xpath}
    Input Text    xpath:${xpath}    ${text}

Close Greyboard
    Close Browser

Sign In With Google
    [Arguments]    ${user}    ${password}
    Click    /html/body/div/div/div[1]/div/div/a[1]
    Type Into    //*[@id="identifierId"]    ${user}
    Click    /html/body/div[1]/div[1]/div[2]/div/c-wiz/div/div[2]/div/div[2]/div/div[1]/div/div/button
    Type Into    /html/body/div[1]/div[1]/div[2]/div/c-wiz/div/div[2]/div/div[1]/div/form/span/section[2]/div/div/div[1]/div[1]/div/div/div/div/div[1]/div/div[1]/input    ${password}
    Click    /html/body/div[1]/div[1]/div[2]/div/c-wiz/div/div[2]/div/div[2]/div/div[1]/div/div/button
    Wait Until Location Contains    /dashboard
    Wait Until Page Contains    Greyboard Tester

Sign In With GitHub
    [Arguments]    ${user}    ${password}
    Click    /html/body/div/div/div[1]/div/div/a[2]
    Type Into    //*[@id="login_field"]    ${user}
    Type Into    //*[@id="password"]    ${password}
    Click    /html/body/div[1]/div[3]/main/div/div[3]/form/div/input[12]
    Click    //*[@id="js-oauth-authorize-btn"]

