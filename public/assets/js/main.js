const API_BASE = "http://localhost:8080/api/v1"

$(document).ready(function () {

    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active')
    })

    var dataTable = $('table.datatable').DataTable( {
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
                    return '<a href="#" class="edit-button" data-toggle="modal" data-target="#editModal" data-id="'
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
                    return '<a data-toggle="modal" data-target="#myModal"><i class="fas fa-trash"></i></a>';
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

    })

    $('#editModal').on('change', 'select#country', function () {
        // Get the country ID.
        var countryId = $(this).val()
        fillStates(countryId)
    })

    $('#editModal').on('change', 'select#state', function () {
        // Get the state ID.
        var stateId = $(this).val()
        fillCities(stateId)
    })

    $('#submitButton').on('click', function (e) {
        // Get form data.
        var formData = new FormData($('#employeeForm')[0]);
        var formDataObj = Array.from(formData).reduce((o,[k,v])=>(o[k]=v,o),{});

        var success = false;
        
        // Put request to update address.
        $.ajax({
            type: "PUT",
            url: API_BASE +"/addresses/"+ formDataObj.addressId,
            contentType: "application/json",
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
                if (success) {
                    dataTable.ajax.reload();
                    $('#editModal').modal('hide')
                    $('#successAlert').alert().show()
                    $('#successAlertMessage').text('Record updated successfully.')
                } else {
                    success = true
                }
            },
            error: (error) => {
                $('#editModal').modal('hide')
                $('#errorAlert').alert().show()
                $('#errorAlertMessage').text('Unexpected error has occurred.')
            }
        })

        // Put request to update employee.
        $.ajax({
            type: "PUT",
            url: API_BASE +"/employees/"+ formDataObj.employeeId,
            contentType: "application/json",
            data: JSON.stringify({
                "firstName": formDataObj.firstName,
                "lastName": formDataObj.lastName,
                "email": formDataObj.email,
                "phoneNumber": formDataObj.phoneNumber,
                "address": {
                    "id": formDataObj.addressId
                },
                "company": {
                    "id": formDataObj.company
                },
                "designation": {
                    "id": formDataObj.designation
                }
            }),
            success: function (res) {
                if (success) {
                    dataTable.ajax.reload();
                    $('#editModal').modal('hide')
                    $('#successAlert').alert().show()
                    $('#successAlertMessage').text('Record updated successfully.')
                } else {
                    success = true
                }
            },
            error: (error) => {
                $('#editModal').modal('hide')
                $('#errorAlert').alert().show()
                $('#errorAlertMessage').text('Unexpected error has occurred.')
            }
        })

    })

})

var fillCompanies = function (companyId) {
    // Clear old.
    $('#company').empty()

    // Company call.
    $.ajax({
        type: "GET",
        url: API_BASE +"/companies",
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
        success: function (res) {
            res.forEach(function (city) {
                var selected = (cityId === city.id) ? 'selected' : '';
                $('#city').append('<option '+ selected +' value="'+ city.id +'">'+ city.name +'</option>')
            })
        }
    })
}
