*** Settings ***
Resource    common.robot

Test Setup    Open Greyboard To Dashboard
Test Teardown    Close Greyboard

Suite Setup    Create Test User
Suite Teardown    Close All Browsers


*** Test Cases ***

Create Board
    [Documentation]    Tests if the user can log out.
    [Tags]    positive

    Click Button With Text    New Board
    Wait Until Location Contains    /b/
    Wait Until Element With Text Is Visible    button    Share
    Wait Until Page Contains    This board will expire in
    Wait Until Element With Text Is Visible    button    Make Permanent


Make New Board As Permanent When Created
    [Documentation]    Tests if the user can make a newly created board permanent.
    [Tags]    positive

    Click Button With Text    New Board
    Wait Until Location Contains    /b/
    Wait Until Element With Text Is Visible    button    Make Permanent
    Click Button With Text    Make Permanent
    Navigate To    /dashboard
    Wait Until Element Is Visible    //div[contains(@class, "card")]
    Page Should Not Contain   Expires in
    Wait Until Page Does Not Contain Element    /html/body/div/div/div[1]/div/div[3]/div[1]/div/div/div[2]/div[1]/button


Make Board Permanent From Dashboard
    [Documentation]    Tests if the user can make a board permanent from the dashboard.
    [Tags]    positive

    Create Board And Return To Dashboard
    Wait Until Page Contains    Expires in
    Click    /html/body/div/div/div[1]/div/div[3]/div[1]/div/div/div[2]/div[1]/button
    Wait Until Page Does Not Contain    Expires in
    Wait Until Page Does Not Contain Element    /html/body/div/div/div[1]/div/div[3]/div[1]/div/div/div[2]/div[1]/button


Permanent Board Should Not Show Toast
    [Documentation]    Tests if the user opens a board that is permanent, the toast to make it permanent should not appear.
    [Tags]    negative

    Click Button With Text    New Board
    Wait Until Location Contains    /b/
    Wait Until Element With Text Is Visible    button    Make Permanent
    Click Button With Text    Make Permanent
    Navigate To    /dashboard
    Click    //div[contains(@class, "card")]
    Wait Until Location Contains    /b/
    Sleep    1s
    Page Should Not Contain    This board will expire in


Delete Single Board Then Restore It
    [Documentation]    Tests if the user can delete a board from the dashboard.
    [Tags]    positive

    Create Board And Return To Dashboard
    ${boardCount}=    Get Users Board Count
    Click    /html/body/div/div/div[1]/div/div[3]/div[1]/div/div/div[2]/div[2]/button
    ${boardCountAfterDelete}=    Get Users Board Count
    Should Be True    ${boardCountAfterDelete}+1 == ${boardCount}
    Wait Until Page Contains    Successfully deleted, however you can still undo it
    Wait Until Element With Text Is Visible    button    Undo
    Click Button With Text    Undo
    ${boardCountAfterRestore}=    Get Users Board Count
    Should Be True    ${boardCount} == ${boardCountAfterRestore}


Bulk Make Boards Permanent From Dashboard
    [Documentation]    Tests if the user can make multiple boards permanent at once from the dashboard.
    [Tags]    positive

    Create Board And Return To Dashboard
    Create Board And Return To Dashboard
    ${expiringBoardCount}=    Get Element Count    //span[normalize-space(.) = "Expires"]
    ${toBeUpdatedCount}=    Get Element Count    //div[contains(@class, "card")]//input[@type='checkbox']
    Click All    //div[contains(@class, "card")]//input[@type='checkbox']
    Click    /html/body/div/div/div[1]/div/div[2]/div[2]/div[1]/div[2]/div/button
    ${expiringBoardCountAfterUpdate}=    Get Element Count    //span[normalize-space(.) = "Expires"]
    Should Be True    ${expiringBoardCountAfterUpdate}+${toBeUpdatedCount} == ${expiringBoardCount}


Bulk Delete Multiple Boards From Dashboard
    [Documentation]    Tests if the user can delete multiple boards at once from the dashboard.
    [Tags]    positive

    Create Board And Return To Dashboard
    Create Board And Return To Dashboard
    Wait Until Page Contains Element    //*[contains(@class, "card")]
    ${boardCount}=    Get Users Board Count
    Should Be True    ${boardCount} > 0
    ${toBeDeletedCount}=    Get Element Count    //div[contains(@class, "card")]//input[@type='checkbox']
    Click All    //div[contains(@class, "card")]//input[@type='checkbox']
    Click    /html/body/div/div/div[1]/div/div[2]/div[2]/div[1]/div[3]/button
    ${boardCountAfterDelete}=    Get Users Board Count
    Should Be True    ${boardCountAfterDelete}+${toBeDeletedCount} == ${boardCount}


Rename Single Board From Dashboard
    [Documentation]    Tests if the user can rename a board from the dashboard.
    [Tags]    positive
    
    Create Board And Return To Dashboard
    Click    //div[contains(@class, "toolbarInput")]//p
    Wait Until Element Is Visible    //div[contains(@class, "toolbarInput")]//input[@type="text"]
    ${newName}=    Generate Random String    10
    Type Into Input    //div[contains(@class, "toolbarInput")]//input[@type="text"]    ${newName}
    Wait Until Element Is Visible    //div[contains(@class, "toolbarInput")]//p[text() = "${newName}"]
    Reload Page
    Wait Until Element Is Visible    //div[contains(@class, "toolbarInput")]//p[text() = "${newName}"]


Show Error If Board Name Is Not Valid
    [Documentation]    Tests if the user can rename a board from the dashboard.
    [Tags]    negative

    Create Board And Return To Dashboard
    Click    //div[contains(@class, "toolbarInput")]//p
    Wait Until Element Is Visible    //div[contains(@class, "toolbarInput")]//input[@type="text"]
    Clear Input    //div[contains(@class, "toolbarInput")]//input[@type="text"]
    Page Should Not Contain    //div[contains(@class, "toolbarInput")]//p[text() = ""]
    Wait Until Page Contains    The name of the board is not correct. It can only contain letters, spaces and numbers.
    

*** Keywords ***
Open Greyboard To Dashboard
    Open Greyboard With Logged In User
    Navigate To    /dashboard

Create Board And Return To Dashboard
    Click Button With Text    New Board
    Wait Until Location Contains    /b/
    Wait Until Element With Text Is Visible    button    Share
    Wait Until Page Contains    This board will expire in
    Wait Until Element With Text Is Visible    button    Make Permanent
    Navigate To    /dashboard

Get Users Board Count
    TRY
        Wait Until Element Is Visible  //div[contains(@class, "_card")]
    EXCEPT
        Log  No elements to be counted
    FINALLY
        ${count}=  Get Element Count  //div[contains(@class, "_card")]
    END
    [return]  ${count}