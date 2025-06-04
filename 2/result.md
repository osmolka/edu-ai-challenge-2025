# **Title**: Logout Button Unresponsive in Safari  

## **Description**  
The logout button does not trigger any action when clicked in the Safari browser. This prevents users from securely ending their session, posing potential security and usability risks.  

## **Steps to Reproduce**  
1. Launch the application in **Safari**.  
2. Log in with valid credentials.  
3. Attempt to click the logout button (e.g., in header/menu).  
4. Observe no response (no redirect, session remains active).  

## **Expected vs Actual Behavior**  
| **Expected** | **Actual** |  
|--------------|------------|  
| Clicking logout ends the session and redirects to login/confirmation page. | No action occurs; button is unresponsive. |  

## **Environment (if known)**  
- **Browser**: Safari (v[XX.X] if available)  
- **OS**: macOS [Version] / iOS [Version]  
- **Device**: [e.g., MacBook Air, iPhone 15]  

## **Severity/Impact**  
- **Severity**: High (blocks critical security function).  
- **Impact**: Users cannot log out, risking unauthorized access on shared devices.  
