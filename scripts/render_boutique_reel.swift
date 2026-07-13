import AppKit
import AVFoundation
import CoreVideo
import Foundation

let root = URL(fileURLWithPath: "/Users/mac/Desktop/boutique-el-dar/assets")
let output = URL(fileURLWithPath: CommandLine.arguments.dropFirst().first ?? "/private/tmp/boutique-el-dar-instagram.mp4")

let size = CGSize(width: 1080, height: 1920)
let fps: Int32 = 30
let totalSeconds = 20

struct Scene {
    let image: String
    let title: String
    let subtitle: String?
    let start: Double
    let duration: Double
    let isLogo: Bool
}

let scenes: [Scene] = [
    Scene(image: "logo.jpg", title: "Boutique El Dar", subtitle: "Votre maison, notre passion", start: 0, duration: 2, isLogo: true),
    Scene(image: "0db60164-aa5b-4d83-8312-68667eaa640c.JPG", title: "L'elegance commence chez vous", subtitle: nil, start: 2, duration: 3, isLogo: false),
    Scene(image: "56507a7b-75b9-424a-a7ce-1f1bcbffb279.JPG", title: "Des matieres raffinees", subtitle: nil, start: 5, duration: 3, isLogo: false),
    Scene(image: "4ee583ad-d6ee-418c-8012-fe0c0ab6bb41.JPG", title: "Des details qui changent tout", subtitle: nil, start: 8, duration: 4, isLogo: false),
    Scene(image: "de415bf3-8895-4996-9279-a29f8c11e7d8.JPG", title: "Une maison plus chaleureuse", subtitle: nil, start: 12, duration: 4, isLogo: false),
    Scene(image: "logo.jpg", title: "Commandez votre selection", subtitle: "@boutique_el_dar", start: 16, duration: 4, isLogo: true),
]

func loadCGImage(_ file: String) -> CGImage {
    let url = root.appendingPathComponent(file)
    guard let image = NSImage(contentsOf: url),
          let cgImage = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
        fatalError("Missing image: \(url.path)")
    }
    return cgImage
}

let images = Dictionary(uniqueKeysWithValues: Set(scenes.map(\.image)).map { ($0, loadCGImage($0)) })

try? FileManager.default.removeItem(at: output)
try FileManager.default.createDirectory(at: output.deletingLastPathComponent(), withIntermediateDirectories: true)

let writer = try AVAssetWriter(outputURL: output, fileType: .mp4)
let settings: [String: Any] = [
    AVVideoCodecKey: AVVideoCodecType.h264,
    AVVideoWidthKey: Int(size.width),
    AVVideoHeightKey: Int(size.height),
    AVVideoCompressionPropertiesKey: [
        AVVideoAverageBitRateKey: 8_000_000,
        AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel
    ]
]
let input = AVAssetWriterInput(mediaType: .video, outputSettings: settings)
input.expectsMediaDataInRealTime = false
let attrs: [String: Any] = [
    kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32ARGB,
    kCVPixelBufferWidthKey as String: Int(size.width),
    kCVPixelBufferHeightKey as String: Int(size.height)
]
let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: attrs)
writer.add(input)
writer.startWriting()
writer.startSession(atSourceTime: .zero)

let paragraph = NSMutableParagraphStyle()
paragraph.alignment = .center
paragraph.lineBreakMode = .byWordWrapping

func ease(_ x: Double) -> Double {
    return min(1, max(0, x * x * (3 - 2 * x)))
}

func currentScene(at time: Double) -> Scene {
    return scenes.last(where: { time >= $0.start }) ?? scenes[0]
}

func drawAspectFill(_ image: CGImage, in rect: CGRect, zoom: CGFloat, yOffset: CGFloat = 0, context: CGContext) {
    let imageSize = CGSize(width: image.width, height: image.height)
    let scale = max(rect.width / imageSize.width, rect.height / imageSize.height) * zoom
    let width = imageSize.width * scale
    let height = imageSize.height * scale
    let drawRect = CGRect(x: rect.midX - width / 2, y: rect.midY - height / 2 + yOffset, width: width, height: height)
    context.draw(image, in: drawRect)
}

func drawText(_ text: String, fontSize: CGFloat, rect: CGRect, color: NSColor, weight: NSFont.Weight = .bold) {
    let font = NSFont(descriptor: NSFontDescriptor(fontAttributes: [
        .family: "Baskerville",
        .traits: [NSFontDescriptor.TraitKey.weight: weight.rawValue]
    ]), size: fontSize) ?? NSFont.systemFont(ofSize: fontSize, weight: weight)
    let attrs: [NSAttributedString.Key: Any] = [
        .font: font,
        .foregroundColor: color,
        .paragraphStyle: paragraph,
        .kern: 0
    ]
    NSString(string: text).draw(in: rect, withAttributes: attrs)
}

func drawRoundedPanel(_ rect: CGRect, alpha: CGFloat) {
    NSColor(red: 0.08, green: 0.12, blue: 0.08, alpha: Double(alpha) * 0.72).setFill()
    let path = NSBezierPath(roundedRect: rect, xRadius: 0, yRadius: 0)
    path.fill()
    NSColor(red: 0.79, green: 0.64, blue: 0.36, alpha: Double(alpha) * 0.42).setStroke()
    path.lineWidth = 2
    path.stroke()
}

func makeBuffer(for frame: Int) -> CVPixelBuffer {
    var pixelBuffer: CVPixelBuffer?
    CVPixelBufferPoolCreatePixelBuffer(nil, adaptor.pixelBufferPool!, &pixelBuffer)
    guard let buffer = pixelBuffer else { fatalError("Could not create pixel buffer") }
    CVPixelBufferLockBaseAddress(buffer, [])
    defer { CVPixelBufferUnlockBaseAddress(buffer, []) }

    let context = CGContext(
        data: CVPixelBufferGetBaseAddress(buffer),
        width: Int(size.width),
        height: Int(size.height),
        bitsPerComponent: 8,
        bytesPerRow: CVPixelBufferGetBytesPerRow(buffer),
        space: CGColorSpaceCreateDeviceRGB(),
        bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue
    )!

    let time = Double(frame) / Double(fps)
    let scene = currentScene(at: time)
    let local = (time - scene.start) / scene.duration
    let fadeIn = ease(min(local / 0.16, 1))
    let fadeOut = ease(min((1 - local) / 0.16, 1))
    let alpha = CGFloat(min(fadeIn, fadeOut))

    context.setFillColor(NSColor(red: 0.08, green: 0.12, blue: 0.08, alpha: 1).cgColor)
    context.fill(CGRect(origin: .zero, size: size))

    context.setAlpha(alpha)

    let image = images[scene.image]!
    if scene.isLogo {
        context.setFillColor(NSColor(red: 0.08, green: 0.12, blue: 0.08, alpha: 1).cgColor)
        context.fill(CGRect(origin: .zero, size: size))
        let logoRect = CGRect(x: 150, y: 610, width: 780, height: 780)
        context.draw(image, in: logoRect)
    } else {
        let zoom = CGFloat(1.04 + 0.08 * ease(local))
        let offset: CGFloat
        switch scene.image {
        case "0db60164-aa5b-4d83-8312-68667eaa640c.JPG":
            offset = -80
        case "56507a7b-75b9-424a-a7ce-1f1bcbffb279.JPG":
            offset = 70
        case "4ee583ad-d6ee-418c-8012-fe0c0ab6bb41.JPG":
            offset = 0
        case "de415bf3-8895-4996-9279-a29f8c11e7d8.JPG":
            offset = -20
        default:
            offset = 0
        }
        drawAspectFill(image, in: CGRect(origin: .zero, size: size), zoom: zoom, yOffset: offset, context: context)
        let overlay = CGGradient(colorsSpace: CGColorSpaceCreateDeviceRGB(), colors: [
            NSColor.black.withAlphaComponent(0.02).cgColor,
            NSColor.black.withAlphaComponent(0.08).cgColor,
            NSColor.black.withAlphaComponent(0.78).cgColor
        ] as CFArray, locations: [0, 0.5, 1])!
        context.drawLinearGradient(overlay, start: CGPoint(x: 0, y: 0), end: CGPoint(x: 0, y: size.height), options: [])
    }

    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = NSGraphicsContext(cgContext: context, flipped: false)

    let gold = NSColor(red: 0.79, green: 0.64, blue: 0.36, alpha: Double(alpha))
    let ivory = NSColor(red: 0.98, green: 0.95, blue: 0.9, alpha: Double(alpha))

    if scene.isLogo && scene.start == 0 {
        drawText(scene.title, fontSize: 78, rect: CGRect(x: 110, y: 420, width: 860, height: 100), color: ivory)
        drawText(scene.subtitle ?? "", fontSize: 54, rect: CGRect(x: 110, y: 330, width: 860, height: 100), color: gold, weight: .semibold)
    } else {
        if !scene.isLogo {
            drawRoundedPanel(CGRect(x: 70, y: 236, width: 940, height: 300), alpha: alpha)
        }
        drawText(scene.title, fontSize: scene.isLogo ? 74 : 76, rect: CGRect(x: 92, y: scene.isLogo ? 410 : 300, width: 896, height: 190), color: ivory)
        if let subtitle = scene.subtitle {
            drawText(subtitle, fontSize: 48, rect: CGRect(x: 120, y: 318, width: 840, height: 90), color: gold, weight: .semibold)
        }
    }

    if !scene.isLogo {
        let barRect = CGRect(x: 314, y: 586, width: 452, height: 4)
        NSColor(red: 0.79, green: 0.64, blue: 0.36, alpha: Double(alpha)).setFill()
        NSBezierPath(rect: barRect).fill()
    }

    NSGraphicsContext.restoreGraphicsState()
    return buffer
}

let totalFrames = totalSeconds * Int(fps)
var frame = 0
while frame < totalFrames {
    autoreleasepool {
        while !input.isReadyForMoreMediaData {
            Thread.sleep(forTimeInterval: 0.005)
        }
        let buffer = makeBuffer(for: frame)
        let time = CMTime(value: CMTimeValue(frame), timescale: fps)
        adaptor.append(buffer, withPresentationTime: time)
        frame += 1
    }
}

input.markAsFinished()
let semaphore = DispatchSemaphore(value: 0)
writer.finishWriting {
    semaphore.signal()
}
semaphore.wait()

if writer.status != .completed {
    fatalError("Video writer failed: \(writer.error?.localizedDescription ?? "unknown error")")
}

print(output.path)
