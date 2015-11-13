/// <reference path="../../Common/XrmPageTemplate.js" />

/// <reference path="../../Common/new_softtek_scripts_util_dynamicform.js" />
/// <reference path="JQuery.js" />
/// <reference path="Json2.js" />
/// <reference path="XrmServiceToolkit.js" />

function __initializeForm() {
    Xrm.Page.Cascades.Deprecate("customertypecode", ["1", "200000", "200001", "200002", "200003"]);
    //Priority
    Xrm.Page.Cascades.Deprecate("new_priority", ["100000000", "2", "3", "4", "5"]);
    //Influence Level
    Xrm.Page.Cascades.Deprecate("new_influencelevel", ["2", "3", "4", "100000100", "1"]);
    //Contact Level
    Xrm.Page.Cascades.Deprecate("new_contactlevel", ["100000100", "100000001", "100000002", "100000003", "100000004"]);

    Xrm.Page.Validations.AddTo("new_softtekvertical").When("new_softtekmarketcontact1").EqualsTo(null).Or("new_marketscopecontact").EqualsTo(null).Do().Disabled();
    Xrm.Page.Validations.AddTo("new_softtekvertical").When("new_softtekmarketcontact1").DifferentTo(null).And("new_marketscopecontact").DifferentTo(null).Do().Enabled();

    /* Cascade SofttekMarket = Cloud SAP Industry Solutions, any MarketScope, SofttekVertical = 
                            JIT Automotive Solutions, Pharmalab, ChemQ, eMetal, pCare, SAP Serivces*/
    Xrm.Page.Cascades.AddTo("new_softtekvertical").When("new_softtekmarketcontact1").EqualsTo("100000006").Do().PutOptions(["200000019", "200000020", "200000021", "200000022", "200000023", "200000024"]);
    /* Cascade SofttekMarket = USA & Canada & MarketScope = Global, SofttekVertical =
                              GE Capital,  GE Corporate, GE Energy, GE Manufacturing, ABInveb, Citi, Walmart, HP */
    Xrm.Page.Cascades.AddTo("new_softtekvertical").When("new_softtekmarketcontact1").EqualsTo("100000000").And("new_marketscopecontact").EqualsTo("100000000").Do().PutOptions(["100000026", "100000027", "100000028", "100000029", "100000030", "100000031", "100000033", "100000032"]);

    /* Cascade SofttekMarket =  USA & Canada & MarketScope = Non Global, SofttekVertical = 
                       Conglomerates, Healthcare, Financial Svcs & Ins, Middle Market, Retail&CPG, Strategic Accounts,
                       Comm, Media & Tech, General, Other, Unknown */
    Xrm.Page.Cascades.AddTo("new_softtekvertical").When("new_softtekmarketcontact1").EqualsTo("100000000").And("new_marketscopecontact").EqualsTo("100000001").Do().PutOptions(["100000043", "100000044", "100000000", "100000003", "100000040", "100000004", "100000010", "100000005", "100000007", "100000008"]);

    /* Cascade SofttekMarket = Mexico & Central America & MarketScope = Global, SofttekVertical = 
                            01 Banamex, 02 HP, 03 Walmart, 04 GE, 05 ABInveb */
    Xrm.Page.Cascades.AddTo("new_softtekvertical").When("new_softtekmarketcontact1").EqualsTo("100000001").And("new_marketscopecontact").EqualsTo("100000000").Do().PutOptions(["200000001", "200000002", "200000003", "200000000", "100000011"]);

    /* Cascade SofttekMarket = Mexico & Central America & MarketScope = Non Global, SofttekVertical =
                           06 EST Bancomer, 
                             08 HGM Bimbo, 
                             09 BC Retail y Servicios, 
                             11 BD Financiero,
                             12 BD Honeywell ,
                             13 ZN Named Occidente, 
                             14 Manufactura, 
                             15 SAP, 
                             16 SP, 
                             18 Bajío
                             19 Consultoría Servicios
                             20 Energía y Telcos*/
    Xrm.Page.Cascades.AddTo("new_softtekvertical").When("new_softtekmarketcontact1").EqualsTo("100000001").And("new_marketscopecontact").EqualsTo("100000001").Do().PutOptions(["100000012", "100000014", "100000045", "100000017", "100000019", "100000041", "100000042", "100000016", "100000018", "100000053", "100000054", "100000055"]);
    //***********************************************************
    /* Cascade SofttekMarket = HSA & MarketScope = Global, SofttekVertical =
                            GE Capital,  GE Corporate */
    Xrm.Page.Cascades.AddTo("new_softtekvertical").When("new_softtekmarketcontact1").EqualsTo("100000003").And("new_marketscopecontact").EqualsTo("100000000").Do().PutOptions(["100000026", "100000027", "100000028", "100000029", "100000030", "100000031", "100000032", "100000033"]);
    /* Cascade SofttekMarket = HSA & MarketScope = Global, SofttekVertical = Communications, Networks & Peripherals, USA & Canada & MarketScope = Non Global, SofttekVertical = 
                            Financial Services & Insurance, Manufacturing and Consumer Product, Middle Market, Retail, Strategic Accounts,
                            Technology & Media, General, Other, Unknown */
    Xrm.Page.Cascades.AddTo("new_softtekvertical").When("new_softtekmarketcontact1").EqualsTo("100000003").And("new_marketscopecontact").EqualsTo("100000001").Do().PutOptions(["100000046", "100000047", "100000048", "100000049", "100000050", "100000051", "100000052"]);

    //************************************************************
    /* Cascade SofttekMarket = Europe, MarketScope = Global, SofttekVertical =
                            GE Capital,	GE Corporate,	GE Energy,	GE Infrastructure,	ABInveb,	 Citi,	Walmart,	HP */
    Xrm.Page.Cascades.AddTo("new_softtekvertical").When("new_softtekmarketcontact1").EqualsTo("100000005").And("new_marketscopecontact").EqualsTo("100000000").Do().PutOptions(["100000026", "100000027", "100000028", "100000029", "100000030", "100000031", "100000032", "100000033"]);

    /* Cascade SofttekMarket = Europe, MarketScope = Non Global, SofttekVertical =
                    Internacional,	Nacional NovaGaliciaBanco,	Nacional Madrid,	Nacional Galicia,	Nacional Otros,	SAP*/
    Xrm.Page.Cascades.AddTo("new_softtekvertical").When("new_softtekmarketcontact1").EqualsTo("100000005").And("new_marketscopecontact").EqualsTo("100000001").Do().PutOptions(["100000034", "100000035", "100000036", "100000037", "100000038", "100000039"]);

    /* Cascade SofttekMarket != Mexico & Central America, USA & Canada, Cloud SAP Industry Solutions,Hispanic South America, Softtek Vertical =
                           General */
    Xrm.Page.Cascades.AddTo("new_softtekvertical").When("new_softtekmarketcontact1").DifferentTo("100000006").And("new_softtekmarketcontact1").DifferentTo("100000005").And("new_softtekmarketcontact1").DifferentTo("100000000").And("new_softtekmarketcontact1").DifferentTo("100000003").And("new_softtekmarketcontact1").DifferentTo("100000001").Do().PutOptions(["100000005"]);

    /*Cascade SofttekMarket = Brazil and Market Scope = Global, Softtek Vertical = 
    GE Capital
    GE Corporate
    GE Energy
    GE Manufacturing
    ABInveb
    Citi
    Walmart
    HP
    */
    Xrm.Page.Cascades.AddTo("new_softtekvertical").When("new_softtekmarketcontact1").EqualsTo("100000002").And("new_marketscopecontact").EqualsTo("100000000").Do().PutOptions(["100000026","100000027","100000028","100000029","100000030","100000031","100000032","100000033"]);

    /*Cascade SofttekMarket = China and Market Scope = Global, Softtek Vertical = 
    GE Capital
    GE Corporate
    GE Energy
    GE Manufacturing
    ABInveb
    Citi
    Walmart
    HP
    */
    Xrm.Page.Cascades.AddTo("new_softtekvertical").When("new_softtekmarketcontact1").EqualsTo("100000004").And("new_marketscopecontact").EqualsTo("100000000").Do().PutOptions(["100000026","100000027","100000028","100000029","100000030","100000031","100000032","100000033"]);



    
    /* Deprecate from Softtek Vertical :
                            05 EST-Bancomer [Deprecado], 06 EST-IBM Metlife [Deprecado], 07 HGM-Bimbo [Deprecado], 08 HGM-Named [Deprecado], 09 BD-Named [Deprecado],
                            10 BD-Financiero [Deprecado], 11 BD-Honeywell [Deprecado], 13 ZN-Urbi [Deprecado], 14 SAP [Deprecado], 15 SP [Deprecado] */
    Xrm.Page.Cascades.Deprecate("new_softtekvertical", ["200000004", "200000005", "200000006", "200000011", "200000018", "200000014", "200000017", "200000016", "200000012", "200000015"]);

}

function onLoad() {
    __initializeForm();
    Xrm.Page.getControl("originatingleadid").setDisabled(false);

    Xrm.Page.Validations.Validate("new_softtekvertical");
    Xrm.Page.Cascades.Filter("new_softtekvertical");
    Xrm.Page.Cascades.Filter("customertypecode");
    Xrm.Page.Cascades.Filter("new_priority");
    Xrm.Page.Cascades.Filter("new_influencelevel");
    Xrm.Page.Cascades.Filter("new_contactlevel");

    var statuscode = Xrm.Page.getAttribute("statecode").getValue();

    if (statuscode == 1) {
        Xrm.Page.getControl("new_softtekvertical").setDisabled(true);
    }
}
function onChangeSofttekMarket() {

    Xrm.Page.getAttribute("new_softtekvertical").setValue(null);
    Xrm.Page.Validations.Validate("new_softtekvertical");
    Xrm.Page.Cascades.Filter("new_softtekvertical");

}
function onChangeMarketScope() {
    Xrm.Page.getAttribute("new_softtekvertical").setValue(null);
    Xrm.Page.Validations.Validate("new_softtekvertical");
    Xrm.Page.Cascades.Filter("new_softtekvertical");
}