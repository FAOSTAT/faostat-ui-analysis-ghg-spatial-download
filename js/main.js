define([
        //'jquery',
        'handlebars',
        'text!faostat-ui-analysis-ghg-spatial-download/html/templates.html',
        'i18n!faostat-ui-analysis-ghg-spatial-download/nls/translate',
        'text!faostat-ui-analysis-ghg-spatial-download/config/data.json',
        'jstree',
        ], function (
    //$,
    Handlebars,
    templates,
    translate,
    data) {

    'use strict';

    function GHG_SPATIAL_DOWNLOAD() {
        this.CONFIG = {
            placeholder_id: 'tiles_container',
            datasource: 'faostatdb',
            lang_faostat: 'E',
            url_rest: 'http://faostat3.fao.org/wds/rest/procedures/usp_GetListBox',

            country_selector_id: 'country_selector_id',
            accordion_datatype_id: 'accordion_datatype_id',
            accordion_products_id: 'accordion_products_id'
        };
    }

    GHG_SPATIAL_DOWNLOAD.prototype.init = function(config) {
        this.CONFIG.data = $.parseJSON(data);
        this.CONFIG = $.extend(true, {}, this.CONFIG, config);
        this.render()
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
        $('#' + this.CONFIG.placeholder_id).html(html);

        // render the tree with countries
        this.renderTree(this.CONFIG.country_selector_id);

        // render the data to download
        this.renderDownloadData(this.CONFIG.accordion_datatype_id);
    };

    GHG_SPATIAL_DOWNLOAD.prototype.renderTree = function(id) {
        /* REST URL */
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
                var tree = $("#" + id);
                tree.jstree({
                    'plugins': ['unique', 'search', 'types', 'wholerow'],
                    'core': {
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
                //swal({
                //    title: translate.error,
                //    type: 'error',
                //    text: a.responseText
                //});
            }
        });
    };

    GHG_SPATIAL_DOWNLOAD.prototype.renderDownloadData = function(id) {
        //$(id).clear();
        /* Iterate over data types. (each one is an accordion) */
        for (var i in this.CONFIG.data) {
            this.renderDataType(id, this.CONFIG.data[i])
        }
    }

    GHG_SPATIAL_DOWNLOAD.prototype.renderDataType = function(id, data) {
        console.log(data);
        /* render data type */
        /* Load template. */
        var source = $(templates).filter('#accordion_datatype').html();
        // bootstrap accordion ids
        var accordion_datatype_id = id;
        var datatype_heading_id = "datatype_heading_" + data.name;
        var datatype_products_id = "datatype_products_" + data.name;
        var products_list_id = "products_list_" + data.name;

        var template = Handlebars.compile(source);
        var dynamic_data = {
            title: translate[data.name],
            accordion_datatype_id: accordion_datatype_id,
            datatype_heading_id: datatype_heading_id,
            datatype_products_id: datatype_products_id,
            products_list_id: products_list_id
        };
        var html = template(dynamic_data);
        $("#" + id).append(html);

        for (var i in data.product) {
            this.renderProduct(products_list_id, data.product[i])
        }
    }

    GHG_SPATIAL_DOWNLOAD.prototype.renderProduct = function(id, data) {
        console.log(data);
        //{
        //    "downloadID": "gfed4_burned_area_yearly",
        //    "name": "gfed4_burned_area_yearly",
        //    "description": "burned_dry_matter",
        //    "layers":[
        //    {
        //        "name": "humid_tropical_forest"
        //    },
        //    {
        //        "name": "other_forest"
        //    }
        //]
        //}

        /* Load template. */
        var source = $(templates).filter('#product_structure').html();
        var template = Handlebars.compile(source);
        var dynamic_data = {
            title: translate[data.name],
            description: translate[data.description],
            download_layers: translate.download_layers
        };
        var html = template(dynamic_data);
        $("#" + id).append(html);
    }

    return GHG_SPATIAL_DOWNLOAD;
});