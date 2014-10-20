import sys
import csv
import glob
from xml.dom import minidom

out = open("out.csv", 'wt')

try:
    writer = csv.writer(out, quoting=csv.QUOTE_NONNUMERIC)
    writer.writerow( ('TotalCompressions', 'CorrectlyReleasedCompression', 'CompressionMeanDepth', 'AverageHandsOffTime', 'CompressionMeanRate', 'CompressionMeanRatio', 'CorrectHandPosition', 'TotalVentilations', 'CorrectlyReleasedVentilation', 'VentilationMeanVolume', 'VentilationMeanRate', 'SessionDuration', 'SessionCycles', 'TotalCprScore', 'CompressionScore', 'VentilationScore', 'FlowFractionScore', 'FlowFractionPercent', 'ScoreLevel', 'ManikinType') )
    
    files = glob.glob("xml/*")

    print files

    for f in files:
        doc = minidom.parse(f)

        TotalCompressions = doc.getElementsByTagName("TotalCompressions")[0].childNodes[0].data
        CorrectlyReleasedCompression = doc.getElementsByTagName("CorrectlyReleasedCompression")[0].childNodes[0].data
        CompressionMeanDepth = doc.getElementsByTagName("CompressionMeanDepth")[0].childNodes[0].data
        AverageHandsOffTime = doc.getElementsByTagName("AverageHandsOffTime")[0].childNodes[0].data
        CompressionMeanRate = doc.getElementsByTagName("CompressionMeanRate")[0].childNodes[0].data
        CompressionMeanRatio = doc.getElementsByTagName("CompressionMeanRatio")[0].childNodes[0].data
        CorrectHandPosition = doc.getElementsByTagName("CorrectHandPosition")[0].childNodes[0].data
        TotalVentilations = doc.getElementsByTagName("TotalVentilations")[0].childNodes[0].data
        CorrectlyReleasedVentilation = doc.getElementsByTagName("CorrectlyReleasedVentilation")[0].childNodes[0].data
        VentilationMeanVolume = doc.getElementsByTagName("VentilationMeanVolume")[0].childNodes[0].data
        VentilationMeanRate = doc.getElementsByTagName("VentilationMeanRate")[0].childNodes[0].data
        SessionDuration = doc.getElementsByTagName("SessionDuration")[0].childNodes[0].data
        SessionCycles = doc.getElementsByTagName("SessionCycles")[0].childNodes[0].data
        TotalCprScore = doc.getElementsByTagName("TotalCprScore")[0].childNodes[0].data
        CompressionScore = doc.getElementsByTagName("CompressionScore")[0].childNodes[0].data
        VentilationScore = doc.getElementsByTagName("VentilationScore")[0].childNodes[0].data
        FlowFractionScore = doc.getElementsByTagName("FlowFractionScore")[0].childNodes[0].data
        FlowFractionPercent = doc.getElementsByTagName("FlowFractionPercent")[0].childNodes[0].data
        ScoreLevel = doc.getElementsByTagName("ScoreLevel")[0].childNodes[0].data
        ManikinType = doc.getElementsByTagName("ManikinType")[0].childNodes[0].data
        writer.writerow( (  TotalCompressions,
                            CorrectlyReleasedCompression,
                            CompressionMeanDepth,
                            AverageHandsOffTime,
                            CompressionMeanRate,
                            CompressionMeanRatio,
                            CorrectHandPosition,
                            TotalVentilations,
                            CorrectlyReleasedVentilation,
                            VentilationMeanVolume,
                            VentilationMeanRate,
                            SessionDuration,
                            SessionCycles,
                            TotalCprScore,
                            CompressionScore,
                            VentilationScore,
                            FlowFractionScore,
                            FlowFractionPercent,
                            ScoreLevel,
                            ManikinType ) )

finally:
    out.close()
