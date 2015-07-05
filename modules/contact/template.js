(function($) {
  $(document).ready(function() {

    $("body").on("click", ".snowball-block-contact .submit", function() {
      var form = $(this).closest("form");
      var to = form.find("[name='to']").val();
      var subject = form.find("[name='subject']").val();
      var confirmation = form.find("[name='confirmation']").val();
      var message = "";
      var others = form.find("input, textarea").not("[type='hidden']");

      others.each(function() {
        var val = $(this).val();

        if ($(this).attr("name")) {
          message = message + "\n\n" + $(this).attr("name") + ": " + val;
        } else {
          message = message + "\n\n" + val;
        }
      });

      var data = {
        action: "mail_before_submit",
        to: to,
        subject: subject,
        message: message
      };

      if (window.parent) {
        snowball = window.parent.snowball;
      }

      jQuery.post(snowball.adminUrl + "admin-ajax.php", data, function(response) {
        form.text(confirmation);
      });
    });

  });
})(jQuery);
