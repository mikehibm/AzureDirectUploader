# Azure Direct Uploader

<img src="https://raw.github.com/wiki/mikehibm/AzureDirectUploader/images/AzureDirectUploader.png" width="300">

Uploads an entire local directory to Azure Storage (Blob) directly from browsers.

Uses JavaScript and ASP.NET WebAPI.

All confidential settings such as Azure Storage connection string are contained in 'private.config' file on the server, so the client side JavaScript does not have access to them.

At first, the client side script needs to call an web API so that a SAS(Shared Access Signature) is created on the server. After that, actual uploads are handled on the client side by making requests to the Azure service directly from the browser.

This sample program takes advantage of HTML5 File API and might work only on Chrome browser because it uses 'directory' attribute for input tag.

# How to run

- Rename the 'private-example.config' file to 'private.config'.

- Edit the private.config file and put your Azure Storage connection string, account name, and container name. 

- Open the solution with Visual Studio 2015 or higher and run.
