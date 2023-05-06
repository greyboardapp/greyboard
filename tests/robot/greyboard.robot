*** Settings ***
Library     String
Library     Selenium2Library

Suite Teardown      Close All Browsers


*** Variables ***
${HOST}    %{RFW_HOST}
${BROWSER}    %{RFW_BROWSER}
${USERNAME}    %{RFW_USERNAME}
${PASSWORD}    %{RFW_PASSWORD}


*** Test Cases ***
Open Page
    [Documentation]    Tests if the web applications opens or not.
    [Tags]    positive
    Open greyboard
    Close greyboard

Sign In
    [Documentation]    Tests if the user can sign in with third parties.
    [Tags]    positive
    Open greyboard
    Sign In With Google    ${USERNAME}    ${PASSWORD}
    Close greyboard

Log Out
    [Documentation]    Tests if the user can log out.
    [Tags]    positive
    Open greyboard
    Sign In With Google    ${USERNAME}    ${PASSWORD}
    Navigate To    /
    Click Button With Text    Log out
    Wait Until Page Contains    Sign in with...
    Close greyboard

Go to Dashboard from Home Page
    [Documentation]    Tests if the user can open the dashboard from the home page.
    [Tags]    positive
    Open greyboard
    Sign In With Google    ${USERNAME}    ${PASSWORD}
    Navigate To    /
    Click Button With Text    Go to my Dashboard
    Wait Until Location Contains    /dashboard
    Wait Until Page Contains    Greyboard Tester
    Close greyboard

Create Board
    [Documentation]    Tests if the user can create a new board.
    [Tags]    positive
    Open greyboard
    Sign In With Google    ${USERNAME}    ${PASSWORD}
    Click Button With Text    New Board
    Wait Until Location Contains    /b/
    Wait Until Element With Text Is Visible    button    Share
    Wait Until Page Contains    This board will expire in
    Wait Until Element With Text Is Visible    button    Make Permanent
    Close greyboard

*** Keywords ***
Open greyboard
    Open Browser    ${HOST}    browser=${BROWSER}
    Wait Until Page Contains    Greyboard
    Wait Until Page Contains    A small online collaborative whiteboard application for mocking, wireframing, solving problems and sketching.

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

Close greyboard
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



