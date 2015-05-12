define([
        //'jquery',
        'handlebars',
        'text!faostat-ui-analysis-ghg-spatial-download/html/templates.html',
        'i18n!faostat-ui-analysis-ghg-spatial-download/nls/translate',

        // TODO Change it
        //'text!faostat-ui-analysis-ghg-spatial-download/config/data.json',
        'text!geobricks_ui_distribution/config/data.json',
        //'jstree',
        'chosen',
        'sweetAlert'
        ], function (
    //$,
    Handlebars,
    templates,
    translate,
    data) {

    'use strict';

    function GHG_SPATIAL_DOWNLOAD() {
        this.CONFIG = {
            placeholder: 'tiles_container',
            datasource: 'faostatdb',
            lang: 'E',
            lang_faostat: 'E',

            url_rest: 'http://faostat3.fao.org/wds/rest/procedures/usp_GetListBox',

            // download data
            download_projection: "4326",
            download_coding_system: "faostat",
            url_ghg_download: 'http://fenix.fao.org/storage/prod/ghg/{{projection}}/{{product_id}}/{{coding_system}}/{{code}}/{{product_id}}.zip',
            url_ghg_download_global: 'http://fenix.fao.org/storage/prod/ghg/{{projection}}/{{product_id}}/{{product_id}}.zip',

            country_selector_id: 'country_selector_id',
            country_selector_dd_id: 'country_selector_dd_id',
            accordion_datatype_id: 'accordion_datatype_id',
            accordion_products_id: 'accordion_products_id',
            
            // countries
            url_wds_table_json: "http://faostat3.fao.org/wds/rest/table/json",
            query_countries: "SELECT DISTINCT A.AreaCode AS Code, A.AreaName{{lang}} AS Name FROM DomainAreaList AS DA, Area AS A  WHERE DA.DomainCode = 'QC' AND (A.AreaCode = DA.AreaCode ) AND A.AreaCode IN ('238', '87', '97', '33', '273', '219', '260', '64', '237', '72', '154', '38', '207', '54', '200', '3', '208', '147', '195', '36', '163', '167', '166', '264', '184', '63', '128', '106', '91', '133', '20', '103', '220', '75', '251', '192', '19', '201', '48', '2', '28', '211', '57', '173', '131', '59', '156', '58', '172', '213', '151', '239', '221', '222', '114', '299', '70', '270', '27', '11', '216', '21', '37', '188', '129', '16', '100', '18', '85', '7', '13', '50', '138', '214', '125', '145', '89', '223', '96', '244', '226', '182', '250', '8', '203', '235', '95', '86', '160', '174', '193', '190', '66', '53', '215', '256', '141', '110', '120', '137', '189', '61', '198', '149', '169', '32', '140', '118', '180', '4', '225', '74', '218', '47', '178', '84', '40', '35', '233', '176', '10', '236', '122', '134', '124', '55', '230', '102', '231', '39', '217', '199', '179', '115', '229', '162', '82', '202', '196', '144', '73', '104', '157', '93', '205', '123', '175', '9', '191', '177', '153', '112', '79', '148', '105', '49', '88', '143', '108', '90', '170', '161', '23', '258', '159', '68', '127', '1', '183', '130', '52', '6', '234', '44', '209', '210', '272', '276', '117', '65', '26', '187', '25', '142', '136', '101', '69', '116', '119', '224', '150', '14', '168', '29', '94', '240', '46', '194', '22', '227', '181', '135', '45', '81', '126', '146', '17', '107', '113', '121', '249', '41', '185', '212', '155', '12', '5', '67', '255', '109', '132', '277', '56', '60', '83', '165', '158', '243', '98', '99', '80', '171', '197') AND A.AreaLevel = 5 ORDER BY A.AreaName{{lang}} ASC"
        };
    }

    GHG_SPATIAL_DOWNLOAD.prototype.init = function(config) {
        this.CONFIG.data = $.parseJSON(data);
        this.CONFIG = $.extend(true, {}, this.CONFIG, config);
        this.render();
    };

    GHG_SPATIAL_DOWNLOAD.prototype.render = function() {

        /* Load template. */
        var source = $(templates).filter('#main_structure').html();
        var template = Handlebars.compile(source);
        var dynamic_data = {
            title: translate.ghg_spatial_download,
            select_a_country: translate.select_a_country,
            product_list: translate.product_list,
            country_selector_id: this.CONFIG.country_selector_id,
            accordion_datatype_id: this.CONFIG.accordion_datatype_id
        };
        var html = template(dynamic_data);
        $('#' + this.CONFIG.placeholder).html(html);

        // render the tree with countries
        //this.renderTree(this.CONFIG.country_selector_id);
        this.renderCountryDropdown(this.CONFIG.country_selector_id);

        // render the data to download
        this.renderDownloadData(this.CONFIG.accordion_datatype_id);
    };

    GHG_SPATIAL_DOWNLOAD.prototype.renderCountryDropdown = function(id) {
        /* REST URL */
        var _this = this;
        var url = this.CONFIG.url_wds_table_json;
        var template = Handlebars.compile(this.CONFIG.query_countries);
        var dynamic_data = {
            lang: this.CONFIG.lang_faostat
        };
        var data = {};
        var sql = {};

        sql.limit = null;
        sql.query = template(dynamic_data);
        sql.frequency = "NONE";
        data.datasource =this.CONFIG.datasource;
        data.thousandSeparator = ',';
        data.decimalSeparator = '.';
        data.json = JSON.stringify(sql);
        $.ajax({
            type: 'POST',
            data : data,
            url: url,
            success: function (response) {
                /* Cast the response to JSON, if needed. */
                var response = (typeof response == 'string')? $.parseJSON(response): response;

                var html = '<select id="'+ _this.CONFIG.country_selector_dd_id +'">';
                html += '<option value="null">' + translate.please_select + '</option>';
                for(var i=0; i < response.length; i++) {
                    html += '<option value="' + response[i][0] + '">' + response[i][1] + '</option>';
                }
                html += '</select>';

                // add html
                $('#' + id).html(html);
                $('#' + _this.CONFIG.country_selector_dd_id).chosen();
            },
            error: function (a) {
                swal({title: translate.error, type: 'error', text: a.responseText});
            }
        });
    };

    GHG_SPATIAL_DOWNLOAD.prototype.renderTree = function(id) {
        /* REST URL */
        var _this = this;
        this.tree = $("#" + id);
        var url = this.CONFIG.url_rest + '/' + this.CONFIG.datasource + '/QC/1/1/' + this.CONFIG.lang_faostat;
        $.ajax({
            type: 'GET',
            url: url,
            success: function (response) {

                /* Cast the response to JSON, if needed. */
                var json = response;
                if (typeof json == 'string')
                    json = $.parseJSON(response);

                /* Cast array to objects */
                var payload = [];
                for (var i = 0 ; i < json.length ; i++)
                    payload.push({
                        id: json[i][0] + '_' + json[i][3],
                        text: json[i][1],
                        li_attr: {
                            code: json[i][0],
                            type: json[i][3],
                            label: json[i][1]
                        }
                    });

                /* Init JSTree. */
                _this.tree.jstree({
                    'plugins': ['unique', 'search', 'wholerow', 'checkbox' ],
                    'core': {
                        'multiple' : false,
                        'data': payload,
                        'themes': {
                            'stripes': false,
                            'icons': false
                        }
                    },
                    'search': {
                        'show_only_matches': true,
                        'close_opened_onclear': false
                    }
                });
            },
            error: function (a) {
                swal({title: translate.error, type: 'error', text: a.responseText});
            }
        });
    };

    GHG_SPATIAL_DOWNLOAD.prototype.renderDownloadData = function(id) {
        /* Iterate over data types. (each one is an accordion) */
        for (var i in this.CONFIG.data) {
            this.renderDataType(id, this.CONFIG.data[i])
        }
    }

    GHG_SPATIAL_DOWNLOAD.prototype.renderDataType = function(id, data) {
        /* render data type */
        /* Load template. */
        var source = $(templates).filter('#accordion_datatype').html();
        // bootstrap accordion ids
        var accordion_datatype_id = id;
        var datatype_heading_id = "datatype_heading_" + data.title;
        var datatype_products_id = "datatype_products_" + data.title;
        var products_list_id = "products_list_" + data.title;

        var template = Handlebars.compile(source);
        var dynamic_data = {
            title: this.getLabel(data.title),
            accordion_datatype_id: accordion_datatype_id,
            datatype_heading_id: datatype_heading_id,
            datatype_products_id: datatype_products_id,
            products_list_id: products_list_id
        };
        var html = template(dynamic_data);
        $("#" + id).append(html);

        // add toggle icon to the panel selection
        $('#' + datatype_heading_id).click(function (e){
            var chevState = $(e.target).siblings("i.fa").toggleClass('fa-chevron-right fa-chevron-down');
            $("i.fa").not(chevState).removeClass("fa-chevron-down").addClass("fa-chevron-right");
        });

        for (var i in data.product) {
            this.renderProduct(products_list_id, data.product[i])
        }
    }

    GHG_SPATIAL_DOWNLOAD.prototype.renderProduct = function(id, data) {
        /* Load template. */
        var source = $(templates).filter('#product_structure').html();

        var template = Handlebars.compile(source);
        var dynamic_data = {
            title: this.getLabel(data.title),
            description: this.getLabel(data.description),
            download_layers: translate.download_layers,
            download_button_id: data.download.id
        };

        var html = template(dynamic_data);
        $("#" + id).append(html);

        // bind download
        var _this = this;
        $("#" + dynamic_data.download_button_id).click({product_id: data.download.id, isGlobal:data.download.global}, function(event) {
            _this.downloadProduct(
                _this.CONFIG.download_projection,
                event.data.product_id,
                _this.CONFIG.download_coding_system,
                _this.getCountryCode(event.data.isGlobal),
                event.data.isGlobal
            )
        });
    }

    GHG_SPATIAL_DOWNLOAD.prototype.getCountryCode = function(isGlobal) {
        // dirty check
        if (isGlobal)
            return null;
        else {
            var areaCode = $("#" + this.CONFIG.country_selector_dd_id).chosen().val();
            if (areaCode != 'null') {
                return areaCode;
            }
            else {
                swal({title: translate.error, type: 'error', text: translate.select_a_country})
            }
        }

        //if (this.tree.jstree().get_selected(true) <= 0)
        //    swal({title: translate.error, type: 'error', text: translate.select_a_country});
        //else
        //    return this.tree.jstree().get_selected(true)[0].li_attr.code;
    }

    GHG_SPATIAL_DOWNLOAD.prototype.downloadProduct = function(projection, product_id, coding_system, code, isGlobal) {
        var url = (isGlobal)? this.CONFIG.url_ghg_download_global: this.CONFIG.url_ghg_download;

        if(typeof code !== 'undefined') {
            var template = Handlebars.compile(url);
            var dynamic_data = {
                projection: projection,
                product_id: product_id,
                coding_system: coding_system,
                code: code
            };
            console.log(dynamic_data);
            var url = template(dynamic_data);
            console.log(url);
            if (this.urlExists(url)) {
                window.open(url);
                //this.downloadURI(url);
            }
            else {
                swal({title: translate.error, type: 'error', text: translate.product_not_available_for_country});
            }
        }
    }

    GHG_SPATIAL_DOWNLOAD.prototype.urlExists = function(url) {
        //TODO: implement check
        return true;
    }

    GHG_SPATIAL_DOWNLOAD.prototype.downloadURI = function(uri, name)
    {
        var link = document.createElement("a");
        link.download = name;
        link.href = uri;
        try {
            link.click();
        }catch (e){
            console.log(e);
        }
    }

    GHG_SPATIAL_DOWNLOAD.prototype.getLabel = function(label) {
        return translate[label]? translate[label]: label;
    }

    return GHG_SPATIAL_DOWNLOAD;
});