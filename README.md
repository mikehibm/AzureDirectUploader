# Azure Direct Uploader

Uploads an entire local directory to Azure Storage (Blob) directly from browsers.

Uses ASP.NET WebAPI and JavaScript.

All secret keys goes to 'private.config' file on the server side, so the client side JavaScript does not have access to them.

At first, client side script needs to call an web API so that a SAS link is created on the server side. After that, actual uploads are handled on the client side by making requests to the Azure service directly from the browser.

This sample program takes advantage of HTML5 File API and might work only on Chrome browser because it uses 'directory' attribute for input tag.

