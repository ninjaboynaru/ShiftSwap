### Testing Environment
Facebook Dev does not allow for API calls from the local file system *(Drag and drop .html file in web browser)*. It also does not allow for API calls to be made from domains that consists of an ip address *(127.0.0.0:8080/index.html)*  

To test locally, a local server may be setup by running **mongoose 5.0** from the directory of the index.html file of the application to test.

The the hosts file should be modified to reroute **_shiftswap.com_** to **_localhost_** and **_shiftswap.com_** should be added to the FB Dev, *App Domain*, option. Also, the FB Dev option, *Site Url*, should reflect the full url of the website.

Assuming mongoose is set to run on port 8080. The following Url will display the site for testing and should be added to the FB Dev *Site Url* option.
> http://shiftswap.com:8080/index.html


---

The *hosts* file is located at
- C:\Windows\System32\drivers\etc

The following line is to be added to it in order to reroute **_www.shiftswap.com_** to **_localhost_**
- 127.0.0.1 shiftswap.com 

---
