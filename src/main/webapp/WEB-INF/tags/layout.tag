<%@tag description="Overall page template" pageEncoding="UTF-8" %>
<%@attribute name="header_before" fragment="true" %>
<%@attribute name="header_after" fragment="true" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Prank WebApp">
    <meta name="author" content="Lukas Jendele">
    <title>PrankWeb</title>

    <jsp:invoke fragment="header_before"/>
    <!-- Core bootstrap-->
    <link rel="stylesheet"
          href="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <!-- Custom CSS-->
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/PrankWeb.css">
    <!-- Fonts-->
    <link href="https://fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,600italic,700italic,800italic,400,300,600,700,800"
          rel="stylesheet" type="text/css">
    <link href="https://fonts.googleapis.com/css?family=Josefin+Slab:100,300,400,600,700,100italic,300italic,400italic,600italic,700italic"
          rel="stylesheet" type="text/css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
    <script src="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
    <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
    <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
    <![endif]-->

    <jsp:invoke fragment="header_after"/>

</head>
<body>
<!-- Navigation-->
<nav role="navigation" class="navbar navbar-default">
    <div class="container">
        <!-- Brand and toggle get grouped for better mobile display-->
        <div class="navbar-header">
            <button type="button" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1"
                    class="navbar-toggle"><span class="sr-only">Toggle navigation</span><span
                    class="icon-bar"></span><span class="icon-bar"></span><span
                    class="icon-bar"></span></button>
            <!-- navbar-brand is hidden on larger screens, but visible when the menu is collapsed-->
            <a href="${pageContext.request.contextPath}/" class="navbar-brand text-capitalize">Prank</a>
        </div>
        <!-- Collect the nav links, forms, and other content for toggling-->
        <div id="bs-example-navbar-collapse-1" class="collapse navbar-collapse">
            <%--<form class="navbar-form navbar-right form-inline">
                <div class="form-group">
                    <input type="text" class="form-control" placeholder="Search">
                </div>
                <button type="submit" class="btn btn-default">Submit</button>
            </form>--%>
            <ul class="nav navbar-nav navbar-right">
                <li><a href="http://siret.ms.mff.cuni.cz/p2rank" target="_blank">Download</a></li>
                <li><a href="contact.html">Authors</a></li>
                <li><a href="blog.html">Help</a></li>
            </ul>
        </div>
    </div>
</nav>

<jsp:doBody/>

<footer>
    <div class="row">
        <div class="col-lg-12 text-center">
            <p>Copyright &copy; Lukas Jendele, Siret group, Charles University 2016</p>
        </div>
    </div>
</footer>
</body>
</html>