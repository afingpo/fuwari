# 文章更新通知 - 涵哲子居

<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 680px; margin: 0 auto; padding: 15px 0; color: #4a4a4a;">

  {{#posts}}
  <div style="background-color: #ffffff; border-radius: 4px; padding: 25px; margin-bottom: 20px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05), 0 0 1px rgba(0, 0, 0, 0.1); border: 1px solid #f5f5f5;">
    
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
      <tr>
        <td style="padding: 0;">
          <h3 style="margin: 0; font-size: 20px; font-weight: 400; color: #363636; line-height: 1.4;">{{title}}</h3>
        </td>
      </tr>
      {{#published}}
      <tr>
        <td style="padding: 6px 0 0 0;">
          <span style="font-size: 13px; color: #7a7a7a;">*发布于：{{published}}*</span>
        </td>
      </tr>
      {{/published}}
    </table>

    <div style="font-size: 14px; line-height: 1.8; color: #4a4a4a; margin-bottom: 20px; text-align: justify;">
      {{summary}}
    </div>

    <div style="text-align: left;">
      <a href="{{url}}" style="display: inline-block; background-color: #3273dc; color: #ffffff; text-decoration: none; font-size: 13px; padding: 6px 16px; border-radius: 4px; box-shadow: 0 2px 4px rgba(50, 115, 220, 0.1); transition: background-color 0.2s;">
        点击查看[文章详情]
      </a>
    </div>

  </div>
  {{/posts}}

  <div style="background-color: #ffffff; border-radius: 4px; padding: 20px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05), 0 0 1px rgba(0, 0, 0, 0.1); border: 1px solid #f5f5f5; font-size: 13px; color: #7a7a7a; line-height: 1.8;">
    
    <p style="margin: 0 0 8px 0; border-left: 3px solid #dbdbdb; padding-left: 10px;">
      您收到这封邮件，是因为您已订阅文章更新提醒服务。
    </p>
    
    <p style="margin: 8px 0 0 0; padding-left: 13px;">
      &gt; 来自 <code>{{commitSha}}</code> - {{commitMsg}} 的推送
    </p>
    
    <hr style="border: none; border-top: 1px solid #f5f5f5; margin: 15px 0;" />
    
    <p style="margin: 0; text-align: right; font-style: italic; font-size: 12px; color: #b5b5b5;">
      *此通知由 GitHub Actions 自动发布*
    </p>
  </div>

</div>

