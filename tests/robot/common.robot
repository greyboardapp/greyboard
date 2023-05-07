*** Settings ***
Library    String
Library    OperatingSystem
Library    Selenium2Library

*** Variables ***
${HOST}    %{RFW_HOST}
${TOKEN}    %{RFW_TOKEN}
${BROWSER}    %{RFW_BROWSER}
${USERNAME}    %{RFW_USERNAME}
${PASSWORD}    %{RFW_PASSWORD}

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

Click All
    [Arguments]    ${xpath}
    ${elements}=    Get WebElements    xpath:${xpath}
    FOR    ${el}    IN    @{elements}
        Wait Until Element Is Enabled    ${el}
        Wait Until Keyword Succeeds    5x    500ms    Click Element    ${el}
    END

Click Element With Text
    [Arguments]    ${element}    ${text}
    Click    //${element}\[normalize-space(.) = "${text}"]

Click Button With Text
    [Arguments]    ${text}
    Click Element With Text    button    ${text}

Wait Until Element With Text Is Visible
    [Arguments]    ${element}    ${text}
    Wait Until Element Is Enabled    xpath://${element}\[normalize-space(.) = "${text}"]

Clear Input
    [Arguments]    ${xpath}    ${return}=True
    Wait Until Element Is Visible    xpath:${xpath}
    Set Focus To Element    xpath:${xpath}
    Press Keys    xpath:${xpath}    END
    Press Keys    xpath:${xpath}    SHIFT+HOME+DELETE
    IF    ${return} == True
        Press Keys    xpath:${xpath}    RETURN
    END

Type Into
    [Arguments]    ${xpath}    ${text}
    Wait Until Element Is Visible    xpath:${xpath}
    Set Focus To Element    xpath:${xpath}
    Input Text    xpath:${xpath}    ${text}    True

Type Into Input
    [Arguments]    ${xpath}    ${text}    ${clear}=True    ${return}=True
    Wait Until Element Is Visible    xpath:${xpath}
    Set Focus To Element    xpath:${xpath}
    IF    ${clear} == True
        Clear Input    ${xpath}    False
    END
    Press Keys    xpath:${xpath}    ${text}
    IF    ${return} == True
        Press Keys    xpath:${xpath}    RETURN
    END

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

Page Should Not Contain Error Popup
    Page Should Not Contain    Oops, something went wrong...

Close Greyboard
    Close Browser
    Run    npx wrangler d1 execute greyboard-db-dev --local --command="DELETE FROM boards WHERE author = 'e0fd4b98-5f67-47eb-9d95-253f3dbd598b'"
