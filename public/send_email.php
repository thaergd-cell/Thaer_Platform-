
<?php
// إعدادات CORS للسماح بالطلبات من المتصفح
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// التعامل مع طلبات OPTIONS (Preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// قراءة البيانات المرسلة بصيغة JSON
$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->recipient_email) && 
    !empty($data->subject) && 
    !empty($data->body)
) {
    // ملاحظة: هذا الكود يستخدم دالة mail() الافتراضية في PHP.
    // لاستخدام كلمة مرور التطبيق (App Password) الخاصة بـ Gmail بشكل فعلي،
    // يجب استخدام مكتبة PHPMailer لأن دالة mail() لا تدعم مصادقة SMTP.
    // هذا الكود يرسل البريد من السيرفر ولكنه يضع بريد المرسل في ترويسة Reply-To.

    $to = $data->recipient_email;
    $subject = $data->subject;
    $message = $data->body;
    $senderEmail = !empty($data->sender_email) ? $data->sender_email : "noreply@" . $_SERVER['SERVER_NAME'];

    // إعداد الترويسات لضمان وصول البريد بتنسيق HTML ودعم العربية
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: " . $senderEmail . "\r\n";
    $headers .= "Reply-To: " . $senderEmail . "\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

    if(mail($to, $subject, $message, $headers)) {
        http_response_code(200);
        echo json_encode(["success" => true, "message" => "Email sent successfully"]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Server failed to send email via mail() function."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Incomplete data provided."]);
}
?>
