const API_BASE = "http://localhost:8080/api/v1"
const API_TOKEN_COOKIE_KEY = "API_TOKEN";

var apiToken = Cookies.get(API_TOKEN_COOKIE_KEY)

$(document).ready(function () {

    $('#loginButton').on('click', function() {
        var email = $('#email').val();
        var pass = $('#password').val();

        // Login API request.
        $.ajax({
            type: "POST",
            url: API_BASE +"/auth/login",
            contentType: "application/json",
            data: JSON.stringify({
                "username": email,
                "password": pass,
            }),
            success: (res) => {
                Cookies.set(API_TOKEN_COOKIE_KEY, res.token)
                location.href = '/'
            },
            error: (error) => {
                console.log(error)
            }
        })

    })

    // if ('/login' !== location.pathname && '' === apiToken || undefined == apiToken) {
    //     location.href = '/login'
    //     return
    // }

    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active')
    })

    var employeeDataTable = $('#employeeDataTable').DataTable( {
        "ajax": {
            "type"   : "GET",
            "url"    : API_BASE + "/employees",
            "dataSrc": function (json) {
                var data = new Array();
                for(var i=0;i< json.length; i++){
                    data.push({
                        'id': json[i].id,
                        'firstName': json[i].firstName,
                        'lastName': json[i].lastName,
                        'email': json[i].email,
                        'phoneNumber': json[i].phoneNumber,
                        'address': json[i].address,
                        'cityName': json[i].address.city.name,
                        'companyId': json[i].company.id,
                        'company': json[i].company.name,
                        'designationId': json[i].designation.id,
                        'designation': json[i].designation.description,
                    })
                }
                return data;
            }
        },
        "columns": [
            {'data': 'firstName'},
            {'data': 'email'},
            {'data': 'phoneNumber'},
            {'data': 'cityName'},
            {'data': 'company'},
            {'data': 'designation'},
            {
                'searchable': false,
                'orderable': false,
                'mRender': function ( data, type, row ) {
                    return '<a href="#" class="edit-button" data-toggle="modal" data-target="#employeeModal" data-id="'
                    + row.id +'" data-address-id="'+ row.address.id +'" data-company-id="'+ row.companyId
                    +'" data-designation-id="'+ row.designationId +'" data-city-id="'+row.address.city.id
                    +'" data-state-id="'+ row.address.city.state.id +'" data-country-id="'+ row.address.city.state.country.id
                    +'" data-first-name="'+ row.firstName +'" data-last-name="'+ row.lastName
                    +'" data-email="'+ row.email +'" data-phone-number="'+ row.phoneNumber
                    +'" data-address-line-1="'+ row.address.addressLine1 +'" data-address-line-2="'+ row.address.addressLine2
                    +'"><i class="fas fa-pencil"></i></a>';
                }
            },
            {
                'searchable': false,
                'orderable': false,
                'mRender': function ( data, type, row ) {
                    return '<a href="#" class="delete-button" data-toggle="modal" data-target="#confirmModal" data-id="'
                    + row.id +'"><i class="fas fa-trash"></i></a>';
                }
            }
        ]
    } )

    var assetTypeDataTable = $('#assetTypeDataTable').DataTable( {
        "ajax": {
            "type"   : "GET",
            "url"    : API_BASE + "/asset-types",
            "dataSrc": function (json) {
                var data = new Array();
                for(var i=0;i< json.length; i++){
                    data.push({
                        'id': json[i].id,
                        'type': json[i].type,
                    })
                }
                return data;
            }
        },
        "columns": [
            {'data': 'type'},
            {
                'searchable': false,
                'orderable': false,
                'mRender': function ( data, type, row ) {
                    return '<a href="#" class="edit-button" data-toggle="modal" data-target="#assetTypeModal" data-id="'
                    + row.id +'"><i class="fas fa-pencil"></i></a>';
                }
            },
            {
                'searchable': false,
                'orderable': false,
                'mRender': function ( data, type, row ) {
                    return '<a href="#" class="delete-button" data-toggle="modal" data-target="#confirmModal" data-id="'
                    + row.id +'"><i class="fas fa-trash"></i></a>';
                }
            }
        ]
    } )

    $('table').on('click', '.edit-button', function () {
        var cityId = $(this).data('city-id')
        var stateId = $(this).data('state-id')
        var countryId = $(this).data('country-id')
        var companyId = $(this).data('company-id')
        var designationId = $(this).data('designation-id')
        
        // Fill up the modal form.
        $('#firstName').val($(this).data('first-name'))
        $('#lastName').val($(this).data('last-name'))
        $('#email').val($(this).data('email'))
        $('#phoneNumber').val($(this).data('phone-number'))
        $('#addressLine1').val($(this).data('address-line-1'))
        $('#addressLine2').val($(this).data('address-line-2'))
        $('#addressId').val($(this).data('address-id'))
        $('#employeeId').val($(this).data('id'))

        fillCompanies(companyId)
        fillDesignations(designationId)
        fillCountries(countryId)
        fillStates(countryId, stateId)
        fillCities(stateId, cityId)

        $('#submitButton').data('action', 'edit')

    })

    $('table').on('click', '.delete-button', function () {
        $('#confirmButton').data('id', $(this).data('id'))
    })

    $('#employeeModal').on('change', 'select#country', function () {
        // Get the country ID.
        var countryId = $(this).val()
        fillStates(countryId)
    })

    $('#employeeModal').on('change', 'select#state', function () {
        // Get the state ID.
        var stateId = $(this).val()
        fillCities(stateId)
    })

    $('#submitButton').on('click', function (e) {
        // Get form data.
        var formData = new FormData($('#employeeForm')[0])
        var formDataObj = Array.from(formData).reduce((o,[k,v])=>(o[k]=v,o),{})

        var type
        var employeeId

        if ('edit' === $('#submitButton').data('action')) {
            type = "PUT"
            employeeId = formDataObj.employeeId
        } else if ('add' === $('#submitButton').data('action')) {
            type = "POST"
            employeeId = ''
        }

        // Add address.
        $.ajax({
            type: "POST",
            url: API_BASE +"/addresses/",
            contentType: "application/json",
            headers: {
              "Authorization": "Bearer " + apiToken
            },
            data: JSON.stringify({
                "addressLine1": formDataObj.addressLine1,
                "addressLine2": formDataObj.addressLine2,
                "city": {
                    "id": formDataObj.city,
                    "state": {
                        "id": formDataObj.state,
                        "country": {
                            "id": formDataObj.country
                        }
                    }
                }
            }),
            success: function (res) {
                // Add/update employee.
                $.ajax({
                    type: type,
                    url: API_BASE +"/employees/"+ employeeId,
                    contentType: "application/json",
                    headers: {
                      "Authorization": "Bearer " + apiToken
                    },
                    data: JSON.stringify({
                        "firstName": formDataObj.firstName,
                        "lastName": formDataObj.lastName,
                        "email": formDataObj.email,
                        "phoneNumber": formDataObj.phoneNumber,
                        "address": {
                            "id": res.id
                        },
                        "company": {
                            "id": formDataObj.company
                        },
                        "designation": {
                            "id": formDataObj.designation
                        }
                    }),
                    success: function (res) {
                        dataTable.ajax.reload();
                        $('#employeeModal').modal('hide')
                        $('#successAlert').alert().show()
                        $('#successAlertMessage').text('Record added/updated successfully.')
                    },
                    error: (error) => {
                        $('#employeeModal').modal('hide')
                        $('#errorAlert').alert().show()
                        $('#errorAlertMessage').text('Unexpected error has occurred.')
                    }
                })
            },
            error: (error) => {
                $('#editModal').modal('hide')
                $('#errorAlert').alert().show()
                $('#errorAlertMessage').text('Unexpected error has occurred.')
            }
        })

    })

    $('#confirmButton').on('click', function (e) {
        var id = $(this).data('id');
        
        // Put request to update address.
        $.ajax({
            type: "DELETE",
            url: API_BASE +"/employees/"+ id,
            headers: {
              "Authorization": "Bearer " + apiToken
            },
            success: function (res) {
                dataTable.ajax.reload();
                $('#confirmModal').modal('hide')
                $('#successAlert').alert().show()
                $('#successAlertMessage').text('Record deleted successfully.')
            },
            error: (error) => {
                $('#confirmModal').modal('hide')
                $('#errorAlert').alert().show()
                $('#errorAlertMessage').text('Unexpected error has occurred.')
            }
        })
    })

    $('.form-modal').on('hidden.bs.modal', function () {
        $(this).find('form').find("input, textarea, select").val("")
    });

    $('#addButton').on('click', function () {
        fillCompanies();
        fillDesignations();
        fillCountries();

        $('#submitButton').data('action', 'add')
    })

    $('#assetForm').on('submit', function (e) {
        e.preventDefault()

        var formData = new FormData($('#assetForm')[0])

        // File upload ajax call.
        $.ajax({
            type: "POST",
            url: API_BASE +"/assets",
            data: formData,
            enctype: "multipart/form-data",
            processData: false,  // Important!
            contentType: false,
            cache: false,
            headers: {
              "Authorization": "Bearer " + apiToken
            },
            success: function (res) {
                location.reload();
            }
        })
    })

    $('body').on('click', '#deleteAssetButton', function (e) {
        e.preventDefault();

        var id = $(this).data('id')

        $('#confirmAssetDeleteButton').data('id', id)
        $('#confirmModal').modal('show');
    })

    $('body').on('click', '#editAssetButton', function (e) {
        e.preventDefault();

        var id = $(this).data('id')

        // Get asset.
        $.ajax({
            type: "GET",
            url: API_BASE +"/assets/" + id,
            headers: {
              "Authorization": "Bearer " + apiToken
            },
            success: function (res) {
                fillAssetTypes($('#assetTypeInModal'), res.assetType.id)
                $('#assetName').val(res.assetName)
                $('#assetId').val(res.id)
                $('#editAssetModel').modal('show')
            },
            error: function () {
                $('#errorAlert').alert().show()
                $('#errorAlertMessage').text('Unexpected error has occurred.')
            }
        })
    })

    $('body').on('click','#confirmAssetDeleteButton' , function (e) {
        var id = $(this).data('id')
        
        // Put request to update address.
        $.ajax({
            type: "DELETE",
            url: API_BASE +"/assets/" + id,
            success: function (res) {
                showAssets()
                $('#confirmModal').modal('hide')
                $('#successAlert').alert().show()
                $('#successAlertMessage').text('Asset deleted successfully.')
            },
            error: (error) => {
                $('#confirmModal').modal('hide')
                $('#errorAlert').alert().show()
                $('#errorAlertMessage').text('Unexpected error has occurred.')
            }
        })
    })

    $('body').on('click','#editAssetModelSubmitButton' , function (e) {
        
        e.preventDefault()

        var id = $('#assetId').val()
        var name = $('#assetName').val()
        var typeId = $('#assetTypeInModal').val()
      
        // File upload ajax call.
        $.ajax({
            type: "PUT",
            url: API_BASE +"/assets/" + id,
            contentType: "application/json",
            data: JSON.stringify({
                "assetName": name,
                "assetType": {
                    "id": typeId,
                }
            }),
            success: (res) => {
                $('#editAssetModel').modal('hide')
                $('#successAlert').alert().show()
                $('#successAlertMessage').text('Record updated successfully.')
            },
            error: (error) => {
                $('#editAssetModel').modal('hide')
                $('#errorAlert').alert().show()
                $('#errorAlertMessage').text('Unexpected error has occurred.')
            }
        })
    })

    $('body').on('click','#downloadAssetButton' , function (e) {
        
        e.preventDefault()

        var id = $(this).data('id')
      
        // File upload ajax call.
        $.ajax({
            type: "GET",
            url: API_BASE +"/assets/" + id +"/download",
            headers: {
                "Range":"bytes=0-100000",
            },
            async: true,
            success: (res) => {
                // $('#editAssetModel').modal('hide')
                $('#successAlert').alert().show()
                $('#successAlertMessage').text('Asset downloaded successfully.')
                console.log(res)
            },
            error: (error) => {
                // $('#editAssetModel').modal('hide')
                $('#errorAlert').alert().show()
                $('#errorAlertMessage').text('Unexpected error has occurred.')
            }
        })
    })

    fillAssetTypes();

    showAssets();
})

var showAssets = function () {

    // Assets container.
    var assetContainer = $('#assetContainer');

    // Assets call.
    $.ajax({
        type: "GET",
        url: API_BASE +"/assets",
        headers: {
          "Authorization": "Bearer " + apiToken
        },
        success: function (res) {

            assetContainer.empty()

            res.forEach(function (asset) {

                var assetTag

                // Determine tag depending on asset type.
                if (-1 < asset.mimeType.indexOf('video')) {
                    assetTag = '<video class="img-fluid img-thumbnail" controls>'+
                                        '<source src="'+ API_BASE+ '/assets/' + asset.id + '/stream' +'" type="'+ asset.mimeType +'">'+
                                    '</video>'
                } else if (-1 < asset.mimeType.indexOf('image')) {
                    assetTag = '<img class="img-fluid img-thumbnail img-secured" data-src="'+ API_BASE+ '/assets/' + asset.id + '/render' +'" alt="'+ asset.assetName +'"></img>'
                } else {
                    // No preview image tag.
                    assetTag = '<img class="img-fluid img-thumbnail" src="/assets/images/blank-file.png" alt="'+ asset.assetName +'"></img>'
                }

                assetContainer.append('<div class="col-lg-3 col-md-4 col-6">'+
                '<a href="#" class="d-block mb-4 h-45">' +
                    assetTag +
                    '<a href="#" id="editAssetButton" data-id="'+ asset.id +'" class="img-overlay-icon img-overlay-edit-icon"><i class="fas fa-pencil fa-2x"></i></a>'+
                    '<a href="#" id="deleteAssetButton" data-id="'+ asset.id +'" class="img-overlay-icon img-overlay-delete-icon"><i class="fas fa-trash fa-2x"></i></a>'+
                    '<a href="#" id="downloadAssetButton" data-id="'+ asset.id +'" class="img-overlay-icon img-overlay-download-icon"><i class="fas fa-download fa-2x"></i></a>'+
                '</a>'+
            '</div>')
            })
        }
    }).done(renderAllSecuredImages)
}

var fillCompanies = function (companyId) {
    // Clear old.
    $('#company').empty()

    // Company call.
    $.ajax({
        type: "GET",
        url: API_BASE +"/companies",
        headers: {
          "Authorization": "Bearer " + apiToken
        },
        success: function (res) {
            res.forEach(function (company) {
                var selected = (companyId === company.id) ? 'selected' : '';
                $('#company').append('<option '+ selected +' value="'+ company.id +'">'+ company.name +'</option>')
            })
        }
    })
}

var fillDesignations = function (designationId) {
    // Clear old.
    $('#designation').empty()

    // Designation call.
    $.ajax({
        type: "GET",
        url: API_BASE + "/designations",
        headers: {
          "Authorization": "Bearer " + apiToken
        },
        success: function (res) {
            res.forEach(function (designation) {
                var selected = (designationId === designation.id) ? 'selected' : '';
                $('#designation').append('<option '+ selected +' value="'+ designation.id +'">'+ designation.description +'</option>')
            })
        }
    })
}

var fillCountries = function (countryId) {
    // Clear old.
    $('#country').empty()

    // Country call.
    $.ajax({
        type: "GET",
        url: API_BASE + "/countries",
        headers: {
          "Authorization": "Bearer " + apiToken
        },
        success: function (res) {
            res.forEach(function (country) {
                var selected = (countryId === country.id) ? 'selected' : '';
                $('#country').append('<option '+ selected +' value="'+ country.id +'">'+ country.name +'</option>')
            })
        }
    })
}

var fillStates = function (countryId, stateId) {
    // Clear the select box.
    $('#state').empty()

    // State call.
    $.ajax({
        type: "GET",
        url: API_BASE +"/countries/"+ countryId +"/states",
        headers: {
          "Authorization": "Bearer " + apiToken
        },
        success: function (res) {
            res.forEach(function (state) {
                var selected = (stateId === state.id) ? 'selected' : '';
                $('#state').append('<option '+ selected +' value="'+ state.id +'">'+ state.name +'</option>')
            })
        }
    })
}

var fillCities = function (stateId, cityId) {
    // Clear the select box.
    $('#city').empty()

    // City call.
    $.ajax({
        type: "GET",
        url: API_BASE +"/states/"+ stateId +"/cities",
        headers: {
          "Authorization": "Bearer " + apiToken
        },
        success: function (res) {
            res.forEach(function (city) {
                var selected = (cityId === city.id) ? 'selected' : '';
                $('#city').append('<option '+ selected +' value="'+ city.id +'">'+ city.name +'</option>')
            })
        }
    })
}

var fillAssetTypes = function (container, selectedId) {

    container = (undefined === container) ? $('#assetType') : container;
    selectedId = (undefined === selectedId) ? 0 : selectedId;

    // Clear old.
    container.empty()

    // Get asset types.
    $.ajax({
        type: "GET",
        url: API_BASE + "/asset-types",
        headers: {
          "Authorization": "Bearer " + apiToken
        },
        success: function (res) {
            res.forEach(function (assetType) {
                var selected = (selectedId === assetType.id) ? 'selected' : '';
                container.append('<option '+ selected +' value="'+ assetType.id +'">'+ assetType.type +'</option>')
            })
        }
    })
}

var renderAllSecuredImages = () => {
    $('.img-secured').each((i, element) => {
        renderSecuredImage($(element).data('src'), $(element))
    })
}

var renderSecuredImage = (url, imageTagElement) => {
    fetch(url, {
        headers: {
            Authorization: 'Bearer ' + apiToken
        } 
    })
    .then((response) => response.blob())
    .then((blob) => {
        const imageUrl = URL.createObjectURL(blob)
        const img = document.querySelector('img')
        img.addEventListener('load', () => URL.revokeObjectURL(imageUrl))
        imageTagElement.attr('src', imageUrl)
    })
}
