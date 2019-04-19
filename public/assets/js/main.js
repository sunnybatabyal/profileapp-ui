$(document).ready(function () {

    const API_BASE = "http://localhost:8080/api/v1"

    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active')
    })

    $('table.datatable').DataTable( {
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
                        'addressId': json[i].address.id,
                        'address': json[i].address.city.name,
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
            {'data': 'address'},
            {'data': 'company'},
            {'data': 'designation'},
            {
                'searchable': false,
                'orderable': false,
                'mRender': function ( data, type, row ) {
                    return '<a href="#" class="edit-button" data-toggle="modal" data-target="#editModal" data-id="'
                    + row.id +'" data-address-id="'+ row.addressId +'" data-company-id="'+ row.companyId
                    +'" data-designation-id="'+ row.designationId +'"><i class="fas fa-pencil"></i></a>';
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
        var id = $(this).data('id')
        var addressId = $(this).data('address-id')
        var companyId = $(this).data('company-id')
        var designationId = $(this).data('designation-id')

        // ajax call.
        $.ajax({
            type: "GET",
            url: API_BASE + "/employees/" + id,
            success: function (res) {
                // Fill up the modal.
                $('#firstName').val(res.firstName)
                $('#lastName').val(res.lastName)
                $('#email').val(res.email)
                $('#phoneNumber').val(res.phoneNumber)
                $('#company').append('<option selected value="'+ res.company.id +'">'+ res.company.name +'</option>')
                $('#designation').append('<option selected value="'+ res.designation.id +'">'+ res.designation.description +'</option>')

                $('#country').append('<option selected value="'+ res.address.city.state.country.id +'">'+ res.address.city.state.country.name +'</option>')
                $('#state').append('<option selected value="'+ res.address.city.state.id +'">'+ res.address.city.state.name +'</option>')
                $('#city').append('<option selected value="'+ res.address.city.id +'">'+ res.address.city.name +'</option>')

                $('#addressLine1').val(res.address.addressLine1)
                $('#addressLine2').val(res.address.addressLine2)
            }
        })

        // Company call.
        $.ajax({
            type: "GET",
            url: API_BASE + "/companies",
            success: function (res) {
                res.forEach(function (company) {
                    if (companyId !== company.id)
                        $('#company').append('<option value="'+ company.id +'">'+ company.name +'</option>')
                })
            }
        })

        // Designation call.
        $.ajax({
            type: "GET",
            url: API_BASE + "/designations",
            success: function (res) {
                res.forEach(function (designation) {
                    if (designationId !== designation.id)
                        $('#designation').append('<option value="'+ designation.id +'">'+ designation.description +'</option>')
                })
            }
        })

        // Country call.
        $.ajax({
            type: "GET",
            url: API_BASE + "/countries",
            success: function (res) {
                res.forEach(function (country) {
                    // if (companyId !== company.id)
                        $('#country').append('<option value="'+ country.id +'">'+ country.name +'</option>')
                })
            }
        })

    })

})
