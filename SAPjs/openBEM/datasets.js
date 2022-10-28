var datasets = {
    /**********************************
     *  fuels
     *   Data from SAP 10.1
     *  - Notes for developers:
     *      - This list of fuels has been created as they are the ones that best suit our needs at the time of development, there might be many missing so feel free to add new ones
     *      - The only fuels required by the model are: 'generation' and 'Standard Tariff', if you choose to delete any fuel ensure these two ones are kept
     */

    /***************************************************************************************************
     *
     *****************************************************************************************************/
    fuels: {
        'Mains Gas': {
            category: 'Gas',
            standingcharge: 88,
            fuelcost: 3.93,
            co2factor: 0.21,
            primaryenergyfactor: 1.13,
            SAP_code: 1,
        },
        'Bulk LPG': {
            category: 'Gas',
            standingcharge: 58,
            fuelcost: 6.59,
            co2factor: 0.241,
            primaryenergyfactor: 1.141,
            SAP_code: 2,
        },
        'Bottled LPG ': {
            category: 'Gas',
            standingcharge: 0,
            fuelcost: 7.85,
            co2factor: 0.241,
            primaryenergyfactor: 1.141,
            SAP_code: 3,
        },
        'Heating Oil': {
            category: 'Oil',
            standingcharge: 0,
            fuelcost: 4.35,
            co2factor: 0.298,
            primaryenergyfactor: 1.18,
            SAP_code: 4,
        },
        'House Coal': {
            category: 'Solid fuel',
            standingcharge: 0,
            fuelcost: 4.18,
            co2factor: 0.395,
            primaryenergyfactor: 1.064,
            SAP_code: 11,
        },
        Anthracite: {
            category: 'Solid fuel',
            standingcharge: 0,
            fuelcost: 4.14,
            co2factor: 0.395,
            primaryenergyfactor: 1.064,
            SAP_code: 15,
        },
        'Manufactured smokeless fuel': {
            category: 'Solid fuel',
            standingcharge: 0,
            fuelcost: 5.17,
            co2factor: 0.366,
            primaryenergyfactor: 1.261,
            SAP_code: 12,
        },
        'Wood Logs': {
            category: 'Solid fuel',
            standingcharge: 0,
            fuelcost: 4.65,
            co2factor: 0.39,
            primaryenergyfactor: 1.046,
            SAP_code: 20,
        },
        'Wood Pellets secondary heating in bags': {
            category: 'Solid fuel',
            standingcharge: 0,
            fuelcost: 6.09,
            co2factor: 0.39,
            primaryenergyfactor: 1.325,
            SAP_code: 22,
        },
        'Wood pellets main heating bulk supply': {
            category: 'Solid fuel',
            standingcharge: 0,
            fuelcost: 5.51,
            co2factor: 0.39,
            primaryenergyfactor: 1.325,
            SAP_code: 23,
        },
        'Wood chips': {
            category: 'Solid fuel',
            standingcharge: 0,
            fuelcost: 3.48,
            co2factor: 0.39,
            primaryenergyfactor: 1.046,
            SAP_code: 21,
        },
        'Dual Fuel Appliance': {
            category: 'Solid fuel',
            standingcharge: 0,
            fuelcost: 4.53,
            co2factor: 0.39,
            primaryenergyfactor: 1.049,
            SAP_code: 10,
        },
        '7-Hour tariff - High Rate': {
            category: 'Electricity',
            standingcharge: 8,
            fuelcost: 20.72,
            co2factor: 0.136,
            primaryenergyfactor: 1.501,
            SAP_code: 32,
        },
        '7 Hour tariff - Low Rate': {
            category: 'Electricity',
            standingcharge: 0,
            fuelcost: 8.13,
            co2factor: 0.136,
            primaryenergyfactor: 1.501,
            SAP_code: 31,
        },
        '10-hour tariff - High Rate': {
            category: 'Electricity',
            standingcharge: 7,
            fuelcost: 18.71,
            co2factor: 0.136,
            primaryenergyfactor: 1.501,
            SAP_code: 34,
        },
        '10-hour tariff - Low Rate': {
            category: 'Electricity',
            standingcharge: 0,
            fuelcost: 10.68,
            co2factor: 0.136,
            primaryenergyfactor: 1.501,
            SAP_code: 33,
        },
        '24-hour heating tariff': {
            category: 'Electricity',
            standingcharge: 31,
            fuelcost: 10.38,
            co2factor: 0.136,
            primaryenergyfactor: 1.501,
            SAP_code: 35,
        },
        // Do not remove the following fuels from the datasets, they are required by the model
        'Standard Tariff': {
            category: 'Electricity',
            standingcharge: 72,
            fuelcost: 17.56,
            co2factor: 0.136,
            primaryenergyfactor: 1.501,
            SAP_code: 30,
        },
        generation: {
            category: 'Generation',
            standingcharge: 0,
            fuelcost: 0,
            co2factor: 0.136,
            primaryenergyfactor: 1.501,
            SAP_code: 0
        }
    },


    /*********************************************
         * regions
         *
         * Lits of regions, this dataset is important as its index corresponds with many other datasets that have regions as a first dimension
         */
    regions: [
        // UK regions
        'UK average',
        'Thames',
        'South East England',
        'Southern England',
        'South West England',
        'Severn Wales / Severn England',
        'Midlands',
        'West Pennines Wales / West Pennines England.',
        'North West England / South West Scotland',
        'Borders Scotland / Borders England',
        'North East England',
        'East Pennines',
        'East Anglia',
        'Wales',
        'West Scotland',
        'East Scotland',
        'North East Scotland',
        'Highland',
        'Western Isles',
        'Orkney',
        'Shetland',
        'Northern Ireland',
        // USA regions
        /*"Hot-Humid (Miami, FL)",     //"IECC Region 1A",
                "Hot-Humid (Houston, TX)" ,     //"IECC Region 2A",
                "Hot/Mixed-Humid (Atlanta, GA)",  //"IECC Region 3A",
                "Mixed-Humid (Baltimore, MD)",   //"IECC Region 4A",
                "Cold (Chicago, IL)" ,   //"IECC Region 5A",
                "Cold (Minneapolis, MN)",    //"IECC Region 6A",
                "Hot-Dry (Phoenix, AZ)", //"IECC Region 2B",
                "Hot-Dry (CA) (Los Angeles, CA)", //"IECC Region 3B-CA",
                "Hot-Dry (Las Vegas, NV)",    //"IECC Region 3B-Other",
                "Mixed-Dry (Albuquerque, NM)",   //"IECC Region 4B",
                "Cold (Boulder, CO)",    //"IECC Region 5B",
                "Cold (Helena, MT)", //"IECC Region 6B",
                "Mixed-Marine (San Francisco, CA)"  //"IECC Region 3C",
                "Marine (Seattle, WA)",  //"IECC Region 4C",
                "Very Cold (Duluth, MN)",    //"IECC Region 7",
                "Arctic (Fairbanks, AK)"    //"IECC Region 8"*/
        // References:
        // a) https://www1.eere.energy.gov/buildings/publications/pdfs/building_america/4_3a_ba_innov_buildingscienceclimatemaps_011713.pdf
        // b) https://energy.gov/sites/prod/files/2015/10/f27/ba_climate_region_guide_7.3.pdf
        // c) http://en.openei.org/wiki/Commercial_Reference_Buildings
    ],


    /************************************************
         * table_u1
         * Mean external temperature: these data are for typical height above sea level of the regions in datasets.regions
         *
         *  - Units: ˚C
         *  - First dimension: region
         *  - Second dimension: month
         *  - Source: SAP2012, appendix U1, p. 172
         *
         */
    table_u1: [
        // UK regions
        [4.3, 4.9, 6.5, 8.9, 11.7, 14.6, 16.6, 16.4, 14.1, 10.6, 7.1, 4.2],
        [5.1, 5.6, 7.4, 9.9, 13.0, 16.0, 17.9, 17.8, 15.2, 11.6, 8.0, 5.1],
        [5.0, 5.4, 7.1, 9.5, 12.6, 15.4, 17.4, 17.5, 15.0, 11.7, 8.1, 5.2],
        [5.4, 5.7, 7.3, 9.6, 12.6, 15.4, 17.3, 17.3, 15.0, 11.8, 8.4, 5.5],
        [6.1, 6.4, 7.5, 9.3, 11.9, 14.5, 16.2, 16.3, 14.6, 11.8, 9.0, 6.4],
        [4.9, 5.3, 7.0, 9.3, 12.2, 15.0, 16.7, 16.7, 14.4, 11.1, 7.8, 4.9],
        [4.3, 4.8, 6.6, 9.0, 11.8, 14.8, 16.6, 16.5, 14.0, 10.5, 7.1, 4.2],
        [4.7, 5.2, 6.7, 9.1, 12.0, 14.7, 16.4, 16.3, 14.1, 10.7, 7.5, 4.6],
        [3.9, 4.3, 5.6, 7.9, 10.7, 13.2, 14.9, 14.8, 12.8, 9.7, 6.6, 3.7],
        [4.0, 4.5, 5.8, 7.9, 10.4, 13.3, 15.2, 15.1, 13.1, 9.7, 6.6, 3.7],
        [4.0, 4.6, 6.1, 8.3, 10.9, 13.8, 15.8, 15.6, 13.5, 10.1, 6.7, 3.8],
        [4.3, 4.9, 6.5, 8.9, 11.7, 14.6, 16.6, 16.4, 14.1, 10.6, 7.1, 4.2],
        [4.7, 5.2, 7.0, 9.5, 12.5, 15.4, 17.6, 17.6, 15.0, 11.4, 7.7, 4.7],
        [5.0, 5.3, 6.5, 8.5, 11.2, 13.7, 15.3, 15.3, 13.5, 10.7, 7.8, 5.2],
        [4.0, 4.4, 5.6, 7.9, 10.4, 13.0, 14.5, 14.4, 12.5, 9.3, 6.5, 3.8],
        [3.6, 4.0, 5.4, 7.7, 10.1, 12.9, 14.6, 14.5, 12.5, 9.2, 6.1, 3.2],
        [3.3, 3.6, 5.0, 7.1, 9.3, 12.2, 14.0, 13.9, 12.0, 8.8, 5.7, 2.9],
        [3.1, 3.2, 4.4, 6.6, 8.9, 11.4, 13.2, 13.1, 11.3, 8.2, 5.4, 2.7],
        [5.2, 5.0, 5.8, 7.6, 9.7, 11.8, 13.4, 13.6, 12.1, 9.6, 7.3, 5.2],
        [4.4, 4.2, 5.0, 7.0, 8.9, 11.2, 13.1, 13.2, 11.7, 9.1, 6.6, 4.3],
        [4.6, 4.1, 4.7, 6.5, 8.3, 10.5, 12.4, 12.8, 11.4, 8.8, 6.5, 4.6],
        [4.8, 5.2, 6.4, 8.4, 10.9, 13.5, 15.0, 14.9, 13.1, 10.0, 7.2, 4.7],
        // USA regions
        /*[20.3, 21.1, 22.5, 24.2, 26.6, 28.0, 28.8, 28.9, 28.3, 26.5, 23.8, 21.3],
                [11.9, 13.8, 16.9, 20.7, 24.9, 27.7, 28.9, 28.9, 26.3, 21.6, 16.5, 12.3],
                [6.9, 8.7, 12.7, 16.9, 21.4, 25.1, 26.8, 26.4, 23.2, 17.3, 12.3, 7.6],
                [1.5, 2.4, 7.0, 12.5, 17.7, 22.9, 25.4, 24.4, 20.3, 13.7, 8.4, 3.0],
                [-3.9, -2.1, 3.5, 9.6, 15.2, 20.7, 23.4, 22.5, 18.3, 11.5, 4.8, -1.9],
                [-8.6, -6.2, 0.6, 8.7, 15.2, 20.7, 23.1, 21.7, 16.9, 9.5, 1.2, -6.1],
                [13.6, 15.4, 18.6, 22.6, 27.7, 32.7, 34.9, 34.1, 31.4, 25.0, 18.0, 13.0],
                [14.6, 14.6, 16.0, 16.8, 19.0, 20.7, 22.9, 23.1, 22.4, 19.8, 17.0, 14.2],
                [9.2, 11.0, 15.4, 18.8, 25.3, 30.0, 33.9, 32.0, 28.0, 20.5, 13.8, 8.5],
                [3.1, 5.8, 9.4, 13.8, 19.1, 24.1, 25.8, 24.6, 20.9, 14.7, 7.6, 2.7],
                [0.2, 1.3, 5.7, 10.0, 15.1, 20.7, 22.8, 21.9, 17.4, 10.9, 3.8, -0.9],
                [-5.1, -2.7, 2.2, 7.1, 12.1, 16.6, 20.9, 19.9, 14.6, 7.7, 0.6, -5.1],
                [10.9, 12.7, 14.2, 15.6, 16.1, 17.4, 18.1, 18.5, 18.4, 17.8, 14.5, 10.9],
                [5.9, 6.8, 8.7, 11.0, 14.3, 16.8, 19.6, 19.7, 17.1, 12.3, 8.2, 5.3],
                [-11.5, -9.4, -3.1, 4.3, 10.8, 15.8, 18.7, 18.0, 13.3, 6.2, -1.6, -8.9],
                [-2.1, -22.5, -17.8, -11.6, 1.0, 10.0, 16.1, 17.2, 13.8, 7.5, -4.0, -16.2, -20.1]*/
        // References:
        // a) http://ashrae-meteo.info/  1986-2010 for monthly temperature average temp (C)
    ],


    /************************************************
         * table_u2
         * Wind speed (m/s) for calculation of infiltration rate
         *
         *  - Units: m/s
         *  - First dimension: region
         *  - Second dimension: month
         *  - Source: SAP2012, appendix U2, p. 173
         *
         */
    table_u2: [
        // Uk regions
        [5.1, 5.0, 4.9, 4.4, 4.3, 3.8, 3.8, 3.7, 4.0, 4.3, 4.5, 4.7],
        [4.2, 4.0, 4.0, 3.7, 3.7, 3.3, 3.4, 3.2, 3.3, 3.5, 3.5, 3.8],
        [4.8, 4.5, 4.4, 3.9, 3.9, 3.6, 3.7, 3.5, 3.7, 4.0, 4.1, 4.4],
        [5.1, 4.7, 4.6, 4.3, 4.3, 4.0, 4.0, 3.9, 4.0, 4.5, 4.4, 4.7],
        [6.0, 5.6, 5.6, 5.0, 5.0, 4.4, 4.4, 4.3, 4.7, 5.4, 5.5, 5.9],
        [4.9, 4.6, 4.7, 4.3, 4.3, 3.8, 3.8, 3.7, 3.8, 4.3, 4.3, 4.6],
        [4.5, 4.5, 4.4, 3.9, 3.8, 3.4, 3.3, 3.3, 3.5, 3.8, 3.9, 4.1],
        [4.8, 4.7, 4.6, 4.2, 4.1, 3.7, 3.7, 3.7, 3.7, 4.2, 4.3, 4.5],
        [5.2, 5.2, 5.0, 4.4, 4.3, 3.9, 3.7, 3.7, 4.1, 4.6, 4.8, 4.7],
        [5.2, 5.2, 5.0, 4.4, 4.1, 3.8, 3.5, 3.5, 3.9, 4.2, 4.6, 4.7],
        [5.3, 5.2, 5.0, 4.3, 4.2, 3.9, 3.6, 3.6, 4.1, 4.3, 4.6, 4.8],
        [5.1, 5.0, 4.9, 4.4, 4.3, 3.8, 3.8, 3.7, 4.0, 4.3, 4.5, 4.7],
        [4.9, 4.8, 4.7, 4.2, 4.2, 3.7, 3.8, 3.8, 4.0, 4.2, 4.3, 4.5],
        [6.5, 6.2, 5.9, 5.2, 5.1, 4.7, 4.5, 4.5, 5.0, 5.7, 6.0, 6.0],
        [6.2, 6.2, 5.9, 5.2, 4.9, 4.7, 4.3, 4.3, 4.9, 5.4, 5.7, 5.4],
        [5.7, 5.8, 5.7, 5.0, 4.8, 4.6, 4.1, 4.1, 4.7, 5.0, 5.2, 5.0],
        [5.7, 5.8, 5.7, 5.0, 4.6, 4.4, 4.0, 4.1, 4.6, 5.2, 5.3, 5.1],
        [6.5, 6.8, 6.4, 5.7, 5.1, 5.1, 4.6, 4.5, 5.3, 5.8, 6.1, 5.7],
        [8.3, 8.4, 7.9, 6.6, 6.1, 6.1, 5.6, 5.6, 6.3, 7.3, 7.7, 7.5],
        [7.9, 8.3, 7.9, 7.1, 6.2, 6.1, 5.5, 5.6, 6.4, 7.3, 7.8, 7.3],
        [9.5, 9.4, 8.7, 7.5, 6.6, 6.4, 5.7, 6.0, 7.2, 8.5, 8.9, 8.5],
        [5.4, 5.3, 5.0, 4.7, 4.5, 4.1, 3.9, 3.7, 4.2, 4.6, 5.0, 5.0],
        // USA regions
        /*[4.2, 4.5, 4.6, 4.7, 4.2, 3.7, 3.5, 3.5, 3.6, 4.1, 4.3, 4.1],
                [3.6, 4.0, 4.0, 4.0, 3.6, 3.6, 3.1, 2.7, 3.1, 3.1, 3.6, 3.6],
                [4.6, 4.7, 4.9, 4.5, 3.9, 3.6, 3.4, 3.3, 3.6, 3.8, 4.1, 4.4],
                [4.5, 4.5, 4.9, 4.9, 4.0, 3.6, 3.6, 3.6, 3.6, 4.0, 4.0, 4.0],
                [5.4, 5.4, 5.4, 5.4, 4.9, 4.0, 4.0, 3.6, 4.0, 4.5, 4.9, 4.9],
                [4.9, 4.5, 4.9, 5.4, 4.9, 4.9, 4.5, 4.0, 4.5, 4.9, 4.9, 4.5],
                [2.2, 2.7, 3.1, 3.1, 3.1, 3.1, 3.1, 3.1, 2.7, 2.7, 2.2, 2.2],
                [3.1, 3.1, 3.6, 4.0, 3.6, 3.6, 3.6, 3.6, 3.1, 3.1, 3.1, 3.1],
                [3.1, 4.0, 4.9, 4.9, 5.4, 4.9, 4.9, 4.5, 4.0, 3.6, 3.6, 3.1],
                [3.6, 4.0, 4.5, 4.9, 4.5, 4.5, 4.0, 3.6, 3.6, 3.6, 3.6, 3.6],
                [4.5, 4.5, 4.5, 4.9, 4.5, 4.5, 4.0, 4.0, 4.0, 4.5, 4.0, 4.5],
                [3.1, 3.1, 3.6, 4.0, 4.0, 4.0, 3.6, 3.1, 3.1, 3.1, 3.1, 3.1],
                [3.6, 4.0, 4.9, 5.8, 6.3, 6.3, 6.3, 5.8, 5.4, 4.5, 3.6, 3.6],
                [4.5, 4.5, 4.5, 4.5, 4.0, 4.0, 3.6, 3.6, 3.6, 4.0, 4.0, 4.5],
                [5.4, 5.4, 5.4, 5.8, 5.4, 4.9, 4.5, 4.5, 4.9, 5.4, 5.4, 5.4],
                [1.3, 1.8, 2.2, 2.7, 3.6, 3.1, 3.1, 2.7, 2.7, 2.2, 1.8, 1.3] */
    ],

    //      https://www.sercc.com/climateinfo/historical/avgwind.html (miami/atlanta)
    //      https://www.ncdc.noaa.gov/sites/default/files/attachments/wind1996.pdf (all others)

    /************************************************
         * table_u3
         * Mean global solar irradiance (W/m2) on a horizontal plane
         *
         *  - Units: W/m2
         *  - First dimension: region
         *  - Second dimension: month
         *  - Source: SAP2012, appendix U3, p. 174
         *
         */
    table_u3: [
        // Uk regions
        [26, 54, 96, 150, 192, 200, 189, 157, 115, 66, 33, 21],
        [30, 56, 98, 157, 195, 217, 203, 173, 127, 73, 39, 24],
        [32, 59, 104, 170, 208, 231, 216, 182, 133, 77, 41, 25],
        [35, 62, 109, 172, 209, 235, 217, 185, 138, 80, 44, 27],
        [36, 63, 111, 174, 210, 233, 204, 182, 136, 78, 44, 28],
        [32, 59, 105, 167, 201, 226, 206, 175, 130, 74, 40, 25],
        [28, 55, 97, 153, 191, 208, 194, 163, 121, 69, 35, 23],
        [24, 51, 95, 152, 191, 203, 186, 152, 115, 65, 31, 20],
        [23, 51, 95, 157, 200, 203, 194, 156, 113, 62, 30, 19],
        [23, 50, 92, 151, 200, 196, 187, 153, 111, 61, 30, 18],
        [25, 51, 95, 152, 196, 198, 190, 156, 115, 64, 32, 20],
        [26, 54, 96, 150, 192, 200, 189, 157, 115, 66, 33, 21],
        [30, 58, 101, 165, 203, 220, 206, 173, 128, 74, 39, 24],
        [29, 57, 104, 164, 205, 220, 199, 167, 120, 68, 35, 22],
        [19, 46, 88, 148, 196, 193, 185, 150, 101, 55, 25, 15],
        [21, 46, 89, 146, 198, 191, 183, 150, 106, 57, 27, 15],
        [19, 45, 89, 143, 194, 188, 177, 144, 101, 54, 25, 14],
        [17, 43, 85, 145, 189, 185, 170, 139, 98, 51, 22, 12],
        [16, 41, 87, 155, 205, 206, 185, 148, 101, 51, 21, 11],
        [14, 39, 84, 143, 205, 201, 178, 145, 100, 50, 19, 9],
        [12, 34, 79, 135, 196, 190, 168, 144, 90, 46, 16, 7],
        [24, 52, 96, 155, 201, 198, 183, 150, 107, 61, 30, 18]
        // USA regions
        /* [148, 184, 220, 244, 248, 228, 224, 206, 186, 180, 160, 140],
                [142, 170, 216, 250, 260, 254, 266, 240, 208, 186, 148, 130],
                [124, 164, 214, 254, 264, 244, 228, 222, 214, 182, 144, 118],
                [92, 130, 182, 230, 260, 278, 268, 246, 202, 156, 108, 82],
                [84, 124, 180, 220, 252, 278, 276, 250, 202, 138, 92, 72],
                [70, 112, 170, 212, 252, 264, 266, 242, 186, 120, 78, 64],
                [146, 184, 248, 308, 338, 356, 320, 284, 254, 212, 162, 132],
                [130, 164, 230, 284, 316, 340, 324, 300, 250, 198, 148, 122],
                [130, 172, 236, 292, 334, 360, 346, 310, 260, 202, 146, 120],
                [142, 186, 246, 302, 334, 348, 314, 280, 248, 204, 154, 130],
                [110, 150, 214, 266, 296, 328, 320, 286, 230, 172, 122, 98],
                [58, 100, 166, 216, 252, 272, 282, 254, 186, 120, 72, 50],
                [92, 126, 188, 240, 282, 320, 316, 288, 234, 170, 114, 88],
                [34, 72, 130, 186, 236, 258, 266, 236, 166, 96, 48, 34],
                [56, 96, 156, 210, 240, 252, 250, 230, 168, 108, 68, 50],
                [0, 22, 78, 146, 220, 204, 170, 136, 86, 34, 14, 0]*/
        // http://www.soda-pro.com/web-services/meteo-data/monthly-means-solar-irradiance-temperature-relative-humidity
    ],

    /************************************************
         * solar_declination
         * Solar declination for all regions
         *
         *  - Units: ˚
         *  - Index: month
         *  - Source: SAP2012, appendix U3, p. 174
         *
         */
    solar_declination: [ - 20.7, - 12.8, - 1.8, 9.8, 18.8, 23.1, 21.2, 13.7, 2.9, - 8.7, - 18.4, - 23.0],


    /************************************************
         * table_u4
         * Representative latitude and height above mean sea level
         *
         *  - Units:
         *      - Latitude: ˚N
         *      - Height: meters
         *  - First dimension: region
         *  - Second dimension:
         *      - 0: latitude
         *      - 1: Representative height about sea level
         *  - Source: SAP2012, appendix U4, p. 175
         *
         */
    table_u4: [
        [53.5, 79],
        [51.6, 53],
        [51.1, 55],
        [50.9, 50],
        [50.5, 85],
        [51.5, 99],
        [52.6, 116],
        [53.5, 71],
        [54.6, 119],
        [55.2, 101],
        [54.4, 78],
        [53.5, 79],
        [52.1, 29],
        [52.6, 138],
        [55.9, 113],
        [56.2, 117],
        [57.3, 123],
        [57.5, 218],
        [57.7, 59],
        [59.0, 53],
        [60.1, 50],
        [54.6, 72]
    ],


    /************************************************
         * table_u5
         * Constants for calculation of solar flux on vertical and inclined surfaces
         * Angles may need to be converted to radians depending on the software implementation of the sine and cosine functions
         *
         *  - Units: ˚
         *  - First dimension: constant (kx)
         *  - 2nd dimension: orientation
         *      - 0: North
         *      - 1: NE/NW
         *      - 2: East/West
         *      - 3: SE/SW 4:South
         *  - Source: SAP2012, appendix U5, p. 176
         *
         */
    k: {
        1: [26.3, 0.165, 1.44, - 2.95, - 0.66],
        2: [ - 38.5, - 3.68, - 2.36, 2.89, - 0.106],
        3: [14.8, 3.0, 1.07, 1.17, 2.93],
        4: [ - 16.5, 6.38, - 0.514, 5.67, 3.63],
        5: [27.3, - 4.53, 1.89, - 3.54, - 0.374],
        6: [ - 11.9, - 0.405, - 1.64, - 4.28, - 7.4],
        7: [ - 1.06, - 4.38, - 0.542, - 2.72, - 2.71],
        8: [0.0872, 4.89, - 0.757, - 0.25, - 0.991],
        9: [ - 0.191, - 1.99, 0.604, 3.07, 4.59]
    },


    /************************************************
         * table_1a
         * Number of days of each month
         *
         *  - Units: days
         *  - Index: month
         *
         */
    table_1a: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],


    /************************************************
         * table_1c
         * Monthly factors for hot water use, the coefficients in this table are used to calculate
         * the energy used to heat hot water in a specific month when  you know how much you have
         * used in the whole year
         *
         *  - Index: month
         *  - Source: SAP2012, table 1c, p. 194
         *
         */
    table_1c: [1.1, 1.06, 1.02, 0.98, 0.94, 0.90, 0.90, 0.94, 0.98, 1.02, 1.06, 1.10],


    /************************************************
         * table_1d
         * Temperature rise of hot water drawn off (∆Tm, in K)
         *
         *  - Units: K
         *  - Index: month
         *  - Source: SAP2012, table 1d, p. 194
         *
         */
    table_1d: [41.2, 41.4, 40.1, 37.6, 36.4, 33.9, 30.4, 33.4, 33.5, 36.3, 39.4, 39.9],


    /************************************************
         * table_h4
         * Primary circuit loss factors with solar water heating
         *
         *  - Index: month
         *  - Source: SAP2012, appendix H, p. 77
         *
         */
    table_h4: [1.0, 1.0, 0.94, 0.70, 0.45, 0.44, 0.44, 0.48, 0.76, 0.94, 1.0, 1.0],


    /************************************************
         * ratings
         * Primary circuit loss factors with solar water heating
         *
         *  - Source: SAP2012, table 14, p. 231
         *
         */
    ratings: [
        {start: 92, end: 100, letter: 'A', color: '#009a44'},
        {start: 81, end: 91, letter: 'B', color: '#2dca73'},
        {start: 69, end: 80, letter: 'C', color: '#b8f351'},
        {start: 55, end: 68, letter: 'D', color: '#f5ec00'},
        {start: 39, end: 54, letter: 'E', color: '#ffac4d'},
        {start: 21, end: 38, letter: 'F', color: '#fd8130'},
        {start: 1, end: 20, letter: 'G', color: '#fd001a'}
    ],


    /************************************************
         * table_6d_solar_access_factor
         * Solar access factors
         *
         *  - First dimension: shading factor
         *      - 0: heavy - >80% of sky blocked by obstacles
         *      - 1: more than average  - 60% - 80% of sky blocked by obstacles
         *      - 2: average or unknown - 20% - 60% of sky blocked by obstacles
         *      - 3:  very little - <20% of sky blocked by obstacles
         *  - Second dimension:
         *      - 0: winter
         *      - 1: summer
         *  - Source: SAP2012, table 6d, p.216
         *
         */
    table_6d_solar_access_factor: [[0.3, 0.5], [0.54, 0.7], [0.77, 0.9], [1.0, 1.0]],


    /************************************************
         * table_6d_light_access_factor
         * Light access factors
         *
         *  - First dimension: shading factor
         *      - 0: heavy - >80% of sky blocked by obstacles
         *      - 1: more than average  - 60% - 80% of sky blocked by obstacles
         *      - 2: average or unknown - 20% - 60% of sky blocked by obstacles
         *      - 3:  very little - <20% of sky blocked by obstacles
         *  - Source: SAP2012, table 6d, p.216
         *
         */
    table_6d_light_access_factor: [0.5, 0.67, 0.83, 1.0],


    /************************************************
         * target_values
         * This dataset is not required by the model
         *
         *  - Units: kWh/m2.a
         *  - Source: 2050 80% reduction target (Carbon Co-op)
         *
         */
    target_values: {
        space_heating_demand_lower: 20,
        space_heating_demand_upper: 70,
        space_heating_demand_passive_house: 25,
        primary_energy_demand: 120,
        primary_energy_demand_passive_house: 120,
        co2_emission_rate: 17,
        energy_use_per_person: 8.6
    },


    /************************************************
         * target_values
         * This dataset is not required by the model
         *
         *  - Units: kWh/m2.a
         *  - Source: ???
         *
         */
    uk_average_values: {
        space_heating_demand: 120,
        primary_energy_demand: 360,
        co2_emission_rate: 50.3,
        energy_use_per_person: 19.6
    },

    /************************************************
         * table_U6_region_from_postcode
         * This dataset is not required by the model
         *
         *  - First dimension: Postcode
         *  - Second dimension: region index, see datasets.regions
         *  -Source: SAP2012 table U4 p.177
         */
    table_U6_region_from_postcode:[
        ['AB',16],['AL',1],['B',6],['BA',5],['BB',7],['BD',11],['BD23-24',10],['BH',3],['BL',7],['BN',2],['BR',2],['BS',5],['BT',21],['CA',8],['CB',12],['CF',5],['CH',7],['CH5-8',7],['CM',12],['CM21-23',1],['CO',12],['CR',1],['CT',2],['CV',6],['CW',7],['DA',2],['DD',15],['DE',6],['DG',8],['DH',10],['DH4-5',9],['DL',10],['DN',11],['DT',3],['DY',6],['E',1],['EC',1],['EH',15],['EH43-46',9],['EN',1],['EN9',12],['EX',4],['FK',14],['FY',7],
        ['G',14],['GL',5],['GU',1],['GU11-12',3],['GU14',3],['GU28-29',2],['GU30-35',3],['GU46',3],['GU51-52',3],['HA',1],['HD',11],['HG',10],['HP',1],['HR',6],['HS',18],['HU',11],['HX',11],['IG',12],['IP',12],['IV',17],['IV30-32',16],['IV36',16],['KA',14],['KT',1],['KW',17],['KW15-17',19],['KY',15],['L',7],['LA',7],['LA7-23',8],['LD',13],['LE',6],['LL',7],['LL23-27',13],['LL30-78',13],['LN',11],['LS',11],['LS24',10],['LU',1],['M',7],['ME',2],['MK',1],['ML',14],
        ['N',1],['NE',9],['NG',11],['NN',6],['NP',5],['NP8',13],['NR',12],['NW',1],['OL',7],['OX',1],['PA',14],['PE',12],['PE9-12',11],['PE20-25',11],['PH',15],['PH19-25',17],['PH26',16],['PH30-40',17],['PH4-509',14],['PL',4],['PO',3],['PO18-22',2],['PR',7],['RG',1],['RG21-29',],['RH',1],['RH10-20',2],['RM',12],['S',11],['S18',6],['S32-33',6],['S40-45',6],['SA',5],['SA14-20',13],['SA31-48',13],['SA61-73',13],['SE',1],['SG',1],['SK',7],['SK13',6],['SK17',6],['SK22-23',6],
        ['SL',1],['SM',1],['SN',5],['SN7',1],['SO',3],['SP',5],['SP6-11',3],['SR',9],['SR7-8',10],['SS',12],['ST',6],['SW',1],['SY',6],['SY14',7],['SY15-25',13],['TA',5],['TD',9],['TD12',9],['TD15',9],['TF',6],['TN',2],['TQ',4],['TR',4],['TS',10],['TW',1],['UB',1],['W',1],['WA',7],['WC',1],['WD',1],['WF',11],['WN',7],['WR',6],['WS',6],['WV',6],['YO',10],['YO15-16',11],['YO25',11],['ZE',20]
    ],
        
    ventilation_types: {
        "NV":"Natural ventilation",
        "IE":"Intermittent extraction",
        "PS":"Positive input ventilation from loft",
        "DEV":"Whole house extract ventilation",
        "MEV":"Positive input ventilation from outside",
        "MV":"Balanced mechanical ventilation without heat recovery",
        "MVHR":"Balanced mechanical ventilation with heat recovery"
    }
};
