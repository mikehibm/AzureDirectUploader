(function () {
    var _sas;
    var _files = [];

    $('input[type="file"]').on('change', function (e) {
        _files = e.target.files;
        showFileList();
    });

    $('#btnUpload').on('click', function () {
        beginUpload();
        processOneFile(0);
    });

    function showFileList() {
        var fileCount = _files.length;
        var s = "";
        for (i = 0; i < fileCount; i++) {
            var fileName = _files[i].webkitRelativePath || _files[i].name;
            s += "<div class='row' data-key='" + fileName + "'>"
                    + "<div class='chk col-md-1'><input type='checkbox' class='pull-right' checked /></div>"
                    + "<div class='filepath col-md-9'>" + fileName + "</div>"
                    + "<div class='status col-md-2'></div>"
               + "</div>";
        }
        $('#list').html(s);

        if (_files.length) {
            $('#btnUpload').show();
        } else {
            $('#btnUpload').hide();
        }
    }

    function updateStatus(key, status) {
        $('#list').find("[data-key='" + key + "'] .status").html(status);
    }

    function isChecked(key) {
        return $('#list').find("[data-key='" + key + "'] input[type='checkbox']").prop('checked');
    }

    function processOneFile(index) {
        var file = _files[index];
        var fileName = file.webkitRelativePath || file.name;

        if (!isChecked(fileName)) {
            updateStatus(fileName, 'Skipped.');
            processNext(index);
            return;
        }

        var reader = new FileReader();
        reader.onloadend = function (e) {
            var imageData = new Uint8Array(e.target.result);

            updateStatus(fileName, 'Uploading...');

            uploadToAzure(imageData, fileName, file.type)
                .then(function () {
                    updateStatus(fileName, 'Done.');
                    processNext(index);

                }, function (e) {
                    updateStatus(fileName, 'Error');
                    processNext(index);
                });
        }
        reader.readAsArrayBuffer(file);
    }

    function processNext(index) {
        if (index < _files.length - 1) {
            processOneFile(index + 1);
        } else {
            endUpload();
        }
    }

    function beginUpload(e) {
        $('#btnUpload').addClass('disabled');
        $('input[type="file"]').attr('disabled', 'disabled');
    }

    function endUpload(e) {
        $('#btnUpload').removeClass('disabled');
        $('input[type="file"]').removeAttr('disabled');

        if (e) {
            console.log("Error: ", e);
            alert("Error." + JSON.stringify(e));
        } else {
            console.log("All done!");
        }
    }

    function uploadToAzure(imageData, filename, contentType) {
        var $d;

        //First time or if expired, get a new sas from the server. Otherwise, reuse the existing one.
        if (!_sas || moment.utc(_sas.expires).subtract(5, 'minutes') <= moment.utc()) {
            console.log("Getting new SAS from API server.");
            $d = $.ajax({
                url: 'api/azure/sas',
                type: "POST"
            });
        } else {
            console.log("Reusing existing SAS.");
            $d = $.Deferred();
            $d.resolve(_sas);
        }

        return $d.then(function (result) {
            _sas = result;
            return result.url.replace('$filename$', filename.toUpperCase());
        })
        .then(function (url) {
            console.log("Uploading to " + url);
            return $.ajax({
                url: url,
                type: "PUT",
                data: imageData,
                contentType: contentType,
                headers: {
                    'x-ms-blob-type': 'BlockBlob',
                },
                processData: false
            });
        });
    }

}());
