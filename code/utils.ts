export interface ErrorData {
    ok: false;
}

export interface SuccessData<T> {
    ok: true;
    data: T
}

export type Response<T> = SuccessData<T> | ErrorData

async function getSecret(): Promise<string | undefined> {
    let secret = args.widgetParameter;

    if (!secret && config.runsInApp) {
        const alert = new Alert();
        alert.title = "Please fill in your secret";
        alert.message = "The secret can also be filled in the parameter field of the widget settings (tap on widget in wiggle mode)";
        alert.addSecureTextField("secret")
        alert.addAction("Done")
        await alert.presentAlert()
        secret = alert.textFieldValue(0)
    }
    return secret || "INVALID_SECRET";
}

async function getData<T>(url: string): Promise<Response<T>> {
    const req = new Request(url)
    let response: Response<T> = await req.loadJSON()

    return response
}

async function getDataWithSecret<T>(createUrl: (secret?: string) => string): Promise<Response<T>> {
    const secret = await getSecret();
    return getData<T>(createUrl(secret));
}




function createTextWidget(pretitle: string, title: string, subtitle: string, color: string) {
    let w = new ListWidget()
    // w.url = "https://emittime.app"
    w.backgroundColor = new Color(color, 1)
    let preTxt = w.addText(pretitle)
    preTxt.textColor = Color.white()
    preTxt.textOpacity = 0.8
    preTxt.font = Font.systemFont(10)
    w.addSpacer(5)
    let titleTxt = w.addText(title)
    titleTxt.textColor = Color.white()
    titleTxt.font = Font.systemFont(16)
    w.addSpacer(5)
    let subTxt = w.addText(subtitle)
    subTxt.textColor = Color.white()
    subTxt.textOpacity = 0.8
    subTxt.font = Font.systemFont(12)

    // @ts-ignore
    w.addSpacer(null)
    let a = w.addText("")
    a.textColor = Color.white()
    a.textOpacity = 0.8
    a.font = Font.systemFont(12)
    return w
}


function presentErrorWidget() {
    const widget = createTextWidget("EMIT/TIME", "No data", "Did you set the right secret in the parameter field?", "#000")
    Script.setWidget(widget)
}

async function presentErrorAlert() {
    const alert = new Alert();
    alert.title = "Emit/Time Error";
    alert.message = "Did you enter the right secret?"
    alert.addAction("OK");
    return await alert.presentAlert();
}

async function handleError() {
    if (config.runsInWidget) {
        presentErrorWidget()
    }
    if (config.runsInApp) {
        await presentErrorAlert()
    }
    Script.complete();
}


export { getDataWithSecret, createTextWidget, handleError };

